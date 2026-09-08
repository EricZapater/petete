package admin

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"
)

type Repository interface {
	GetUsageMetrics(ctx context.Context) (*UsageMetrics, error)
	GetApiPerformanceMetrics(ctx context.Context) (*ApiPerformanceMetrics, error)
	GetAuditLogs(ctx context.Context, page, pageSize int, search, module string, statusCode *int) (*AuditLogsPaginatedResponse, error)
	ExportAuditLogs(ctx context.Context, search, module string, statusCode *int) ([]AuditLogItem, error)
	SaveAuditLog(ctx context.Context, item *AuditLogItem) error
	GetDBStats() (open, inUse, idle int, waitCount int64)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetDBStats() (open, inUse, idle int, waitCount int64) {
	if r.db == nil {
		return 0, 0, 0, 0
	}
	stats := r.db.Stats()
	return stats.OpenConnections, stats.InUse, stats.Idle, stats.WaitCount
}

func (r *repository) GetUsageMetrics(ctx context.Context) (*UsageMetrics, error) {
	metrics := &UsageMetrics{
		TopInitiatives: make([]TopInitiativeKPI, 0),
		TopClients:     make([]TopClientKPI, 0),
	}

	// 1. Users
	queryUsers := `
		SELECT 
			COUNT(*),
			COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '30 days')
		FROM users
	`
	if err := r.db.QueryRowContext(ctx, queryUsers).Scan(&metrics.TotalUsersCount, &metrics.ActiveUsersLast30DaysCount); err != nil {
		return nil, fmt.Errorf("error querying users metrics: %w", err)
	}

	// 2. Registres Diaris & Hours
	queryHours := `
		SELECT 
			COALESCE(SUM(hores), 0),
			COALESCE(SUM(hores) FILTER (WHERE data >= date_trunc('month', CURRENT_DATE)), 0),
			COUNT(*)
		FROM registres_diaris
	`
	if err := r.db.QueryRowContext(ctx, queryHours).Scan(
		&metrics.TotalHoursTracked,
		&metrics.HoursTrackedThisMonth,
		&metrics.TotalWorklogsCount,
	); err != nil {
		return nil, fmt.Errorf("error querying worklogs metrics: %w", err)
	}
	metrics.TotalHoursTracked = math.Round(metrics.TotalHoursTracked*100) / 100
	metrics.HoursTrackedThisMonth = math.Round(metrics.HoursTrackedThisMonth*100) / 100

	// 3. Actions
	queryActions := `
		SELECT 
			COUNT(*),
			COUNT(*) FILTER (WHERE estat = 'pendent'),
			COUNT(*) FILTER (WHERE estat = 'en_curs'),
			COUNT(*) FILTER (WHERE estat = 'completada')
		FROM accions
	`
	if err := r.db.QueryRowContext(ctx, queryActions).Scan(
		&metrics.TotalActionsCount,
		&metrics.PendingActionsCount,
		&metrics.InProgressActionsCount,
		&metrics.CompletedActionsCount,
	); err != nil {
		return nil, fmt.Errorf("error querying actions metrics: %w", err)
	}

	// 4. Clients
	queryClients := `
		SELECT 
			COUNT(*),
			COUNT(*) FILTER (WHERE actiu = true)
		FROM clients
	`
	if err := r.db.QueryRowContext(ctx, queryClients).Scan(&metrics.TotalClientsCount, &metrics.ActiveClientsCount); err != nil {
		return nil, fmt.Errorf("error querying clients metrics: %w", err)
	}

	// 5. Objectius, Iniciatives, Notes
	queryCounts := `
		SELECT 
			(SELECT COUNT(*) FROM objectius),
			(SELECT COUNT(*) FROM iniciatives),
			(SELECT COUNT(*) FROM notes)
	`
	if err := r.db.QueryRowContext(ctx, queryCounts).Scan(
		&metrics.TotalObjectivesCount,
		&metrics.TotalInitiativesCount,
		&metrics.TotalNotesCount,
	); err != nil {
		return nil, fmt.Errorf("error querying counts metrics: %w", err)
	}

	// 6. Top Initiatives by hours
	queryTopInit := `
		SELECT 
			i.nom,
			COALESCE(c.nom, 'Sense Client') AS client_nom,
			COALESCE(SUM(rd.hores), 0) AS total_hores,
			COUNT(DISTINCT a.id) AS total_accions
		FROM iniciatives i
		LEFT JOIN objectius o ON i.objectiu_id = o.id
		LEFT JOIN clients c ON o.client_id = c.id
		LEFT JOIN accions a ON a.iniciativa_id = i.id
		LEFT JOIN registres_diaris rd ON rd.accio_id = a.id
		GROUP BY i.id, i.nom, c.nom
		ORDER BY total_hores DESC, i.nom ASC
		LIMIT 5
	`
	rowsInit, err := r.db.QueryContext(ctx, queryTopInit)
	if err == nil {
		defer rowsInit.Close()
		for rowsInit.Next() {
			var item TopInitiativeKPI
			if err := rowsInit.Scan(&item.Name, &item.ClientName, &item.TotalHours, &item.ActionsCount); err == nil {
				item.TotalHours = math.Round(item.TotalHours*100) / 100
				metrics.TopInitiatives = append(metrics.TopInitiatives, item)
			}
		}
	}

	// 7. Top Clients by hours
	queryTopCli := `
		SELECT 
			c.nom,
			COALESCE(SUM(rd.hores), 0) AS total_hores,
			COUNT(DISTINCT i.id) AS total_iniciatives,
			COUNT(DISTINCT a.id) AS total_accions
		FROM clients c
		LEFT JOIN accions a ON a.client_id = c.id
		LEFT JOIN iniciatives i ON a.iniciativa_id = i.id
		LEFT JOIN registres_diaris rd ON rd.accio_id = a.id
		GROUP BY c.id, c.nom
		ORDER BY total_hores DESC, c.nom ASC
		LIMIT 5
	`
	rowsCli, err := r.db.QueryContext(ctx, queryTopCli)
	if err == nil {
		defer rowsCli.Close()
		for rowsCli.Next() {
			var item TopClientKPI
			if err := rowsCli.Scan(&item.Name, &item.TotalHours, &item.InitiativesCount, &item.ActionsCount); err == nil {
				item.TotalHours = math.Round(item.TotalHours*100) / 100
				metrics.TopClients = append(metrics.TopClients, item)
			}
		}
	}

	return metrics, nil
}

func (r *repository) GetApiPerformanceMetrics(ctx context.Context) (*ApiPerformanceMetrics, error) {
	resp := &ApiPerformanceMetrics{
		Endpoints: make([]EndpointLatencyKPI, 0),
	}

	// Global metrics
	queryGlobal := `
		SELECT 
			COALESCE(AVG(duration_ms), 0),
			COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 0),
			COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms), 0),
			COUNT(*),
			COALESCE(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END), 0)
		FROM audit_logs
	`
	if err := r.db.QueryRowContext(ctx, queryGlobal).Scan(
		&resp.AvgLatencyMS,
		&resp.P95LatencyMS,
		&resp.P99LatencyMS,
		&resp.TotalRequests,
		&resp.TotalErrors,
	); err != nil {
		return nil, fmt.Errorf("error querying global latency metrics: %w", err)
	}

	if resp.TotalRequests > 0 {
		resp.ErrorRate = float64(resp.TotalErrors) / float64(resp.TotalRequests)
	}

	resp.AvgLatencyMS = math.Round(resp.AvgLatencyMS*100) / 100
	resp.P95LatencyMS = math.Round(resp.P95LatencyMS*100) / 100
	resp.P99LatencyMS = math.Round(resp.P99LatencyMS*100) / 100
	resp.ErrorRate = math.Round(resp.ErrorRate*10000) / 10000

	// Per endpoint metrics
	queryEndpoints := `
		SELECT 
			method,
			endpoint,
			COUNT(*) AS requests_count,
			COALESCE(AVG(duration_ms), 0) AS avg_duration_ms,
			COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 0) AS p95_duration_ms,
			COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms), 0) AS p99_duration_ms,
			COALESCE(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0), 0) AS error_rate
		FROM audit_logs
		GROUP BY method, endpoint
		ORDER BY requests_count DESC, avg_duration_ms DESC
		LIMIT 50
	`
	rows, err := r.db.QueryContext(ctx, queryEndpoints)
	if err != nil {
		return nil, fmt.Errorf("error querying endpoint latency metrics: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ep EndpointLatencyKPI
		if err := rows.Scan(
			&ep.Method,
			&ep.Path,
			&ep.RequestsCount,
			&ep.AvgDurationMS,
			&ep.P95DurationMS,
			&ep.P99DurationMS,
			&ep.ErrorRate,
		); err != nil {
			return nil, fmt.Errorf("error scanning endpoint metric: %w", err)
		}
		ep.AvgDurationMS = math.Round(ep.AvgDurationMS*100) / 100
		ep.P95DurationMS = math.Round(ep.P95DurationMS*100) / 100
		ep.P99DurationMS = math.Round(ep.P99DurationMS*100) / 100
		ep.ErrorRate = math.Round(ep.ErrorRate*10000) / 10000
		resp.Endpoints = append(resp.Endpoints, ep)
	}

	return resp, nil
}

func buildAuditLogsWhereClause(search, module string, statusCode *int) (string, []interface{}) {
	var conditions []string
	var args []interface{}
	idx := 1

	if strings.TrimSpace(search) != "" {
		searchTerm := "%" + strings.TrimSpace(search) + "%"
		conditions = append(conditions, fmt.Sprintf("(al.action ILIKE $%d OR al.endpoint ILIKE $%d OR al.user_email ILIKE $%d OR u.nom ILIKE $%d)", idx, idx, idx, idx))
		args = append(args, searchTerm)
		idx++
	}

	if strings.TrimSpace(module) != "" {
		conditions = append(conditions, fmt.Sprintf("al.module = $%d", idx))
		args = append(args, strings.TrimSpace(module))
		idx++
	}

	if statusCode != nil && *statusCode > 0 {
		if *statusCode == 200 { // 2xx
			conditions = append(conditions, "al.status_code >= 200 AND al.status_code < 300")
		} else if *statusCode == 400 { // 4xx
			conditions = append(conditions, "al.status_code >= 400 AND al.status_code < 500")
		} else if *statusCode == 500 { // 5xx
			conditions = append(conditions, "al.status_code >= 500")
		} else {
			conditions = append(conditions, fmt.Sprintf("al.status_code = $%d", idx))
			args = append(args, *statusCode)
			idx++
		}
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	return whereClause, args
}

func (r *repository) GetAuditLogs(ctx context.Context, page, pageSize int, search, module string, statusCode *int) (*AuditLogsPaginatedResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	whereClause, args := buildAuditLogsWhereClause(search, module, statusCode)

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM audit_logs al
		LEFT JOIN users u ON al.user_id = u.id
		%s
	`, whereClause)

	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, fmt.Errorf("error counting audit logs: %w", err)
	}

	totalPages := 0
	if total > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(pageSize)))
	}

	resp := &AuditLogsPaginatedResponse{
		Items:      make([]AuditLogItem, 0),
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}

	if total == 0 {
		return resp, nil
	}

	offset := (page - 1) * pageSize
	argIdx := len(args) + 1

	selectQuery := fmt.Sprintf(`
		SELECT 
			al.id, al.user_id, u.nom, al.user_email,
			al.action, al.module, al.endpoint, al.method, al.status_code,
			al.duration_ms, al.ip_address, al.user_agent, al.created_at
		FROM audit_logs al
		LEFT JOIN users u ON al.user_id = u.id
		%s
		ORDER BY al.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIdx, argIdx+1)

	queryArgs := append(args, pageSize, offset)
	rows, err := r.db.QueryContext(ctx, selectQuery, queryArgs...)
	if err != nil {
		return nil, fmt.Errorf("error querying audit logs: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item AuditLogItem
		var uid, uName, uEmail, ip, ua sql.NullString
		if err := rows.Scan(
			&item.ID,
			&uid,
			&uName,
			&uEmail,
			&item.Action,
			&item.Module,
			&item.Endpoint,
			&item.Method,
			&item.StatusCode,
			&item.DurationMS,
			&ip,
			&ua,
			&item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning audit log item: %w", err)
		}
		if uid.Valid {
			item.UserID = &uid.String
		}
		if uName.Valid {
			item.UserName = &uName.String
		}
		if uEmail.Valid {
			item.UserEmail = &uEmail.String
		}
		if ip.Valid {
			item.IPAddress = &ip.String
		}
		if ua.Valid {
			item.UserAgent = &ua.String
		}
		resp.Items = append(resp.Items, item)
	}

	return resp, nil
}

func (r *repository) ExportAuditLogs(ctx context.Context, search, module string, statusCode *int) ([]AuditLogItem, error) {
	whereClause, args := buildAuditLogsWhereClause(search, module, statusCode)

	selectQuery := fmt.Sprintf(`
		SELECT 
			al.id, al.user_id, u.nom, al.user_email,
			al.action, al.module, al.endpoint, al.method, al.status_code,
			al.duration_ms, al.ip_address, al.user_agent, al.created_at
		FROM audit_logs al
		LEFT JOIN users u ON al.user_id = u.id
		%s
		ORDER BY al.created_at DESC
		LIMIT 10000
	`, whereClause)

	rows, err := r.db.QueryContext(ctx, selectQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying audit logs for export: %w", err)
	}
	defer rows.Close()

	var items []AuditLogItem
	for rows.Next() {
		var item AuditLogItem
		var uid, uName, uEmail, ip, ua sql.NullString
		if err := rows.Scan(
			&item.ID,
			&uid,
			&uName,
			&uEmail,
			&item.Action,
			&item.Module,
			&item.Endpoint,
			&item.Method,
			&item.StatusCode,
			&item.DurationMS,
			&ip,
			&ua,
			&item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning audit log item for export: %w", err)
		}
		if uid.Valid {
			item.UserID = &uid.String
		}
		if uName.Valid {
			item.UserName = &uName.String
		}
		if uEmail.Valid {
			item.UserEmail = &uEmail.String
		}
		if ip.Valid {
			item.IPAddress = &ip.String
		}
		if ua.Valid {
			item.UserAgent = &ua.String
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *repository) SaveAuditLog(ctx context.Context, item *AuditLogItem) error {
	query := `
		INSERT INTO audit_logs (
			user_id, user_email, action, module, endpoint,
			method, status_code, duration_ms, ip_address, user_agent, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(
		ctx,
		query,
		item.UserID,
		item.UserEmail,
		item.Action,
		item.Module,
		item.Endpoint,
		item.Method,
		item.StatusCode,
		item.DurationMS,
		item.IPAddress,
		item.UserAgent,
		item.CreatedAt,
	)
	return err
}
