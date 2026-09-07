package informe

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Repository interface {
	GetSummary(ctx context.Context, filter ReportFilter) (*ReportSummary, error)
	GetLogs(ctx context.Context, filter ReportFilter) ([]ReportLogRow, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) buildFilterClauses(filter ReportFilter, startIdx int) (string, []interface{}) {
	var clauses []string
	var args []interface{}
	idx := startIdx

	if filter.DataInici != nil {
		clauses = append(clauses, fmt.Sprintf("r.data >= $%d", idx))
		args = append(args, *filter.DataInici)
		idx++
	}

	if filter.DataFi != nil {
		clauses = append(clauses, fmt.Sprintf("r.data <= $%d", idx))
		args = append(args, *filter.DataFi)
		idx++
	}

	if filter.ClientID != nil {
		clauses = append(clauses, fmt.Sprintf("(a.client_id = $%d OR o.client_id = $%d)", idx, idx))
		args = append(args, *filter.ClientID)
		idx++
	}

	if filter.ObjectiuID != nil {
		clauses = append(clauses, fmt.Sprintf("i.objectiu_id = $%d", idx))
		args = append(args, *filter.ObjectiuID)
		idx++
	}

	if filter.IniciativaID != nil {
		clauses = append(clauses, fmt.Sprintf("a.iniciativa_id = $%d", idx))
		args = append(args, *filter.IniciativaID)
		idx++
	}

	if filter.Executor != "" {
		clauses = append(clauses, fmt.Sprintf("a.executor = $%d", idx))
		args = append(args, filter.Executor)
		idx++
	}

	var clauseStr string
	if len(clauses) > 0 {
		clauseStr = " AND " + strings.Join(clauses, " AND ")
	}

	return clauseStr, args
}

func (r *repository) GetSummary(ctx context.Context, filter ReportFilter) (*ReportSummary, error) {
	summary := &ReportSummary{
		DedicacioClients:   []DedicacioGroup{},
		DedicacioObjectius: []DedicacioGroup{},
	}

	// 1. Overall stats
	filterSQL, args := r.buildFilterClauses(filter, 2)
	baseArgs := append([]interface{}{filter.UserID}, args...)

	statsQuery := fmt.Sprintf(`
		SELECT 
			COALESCE(SUM(r.hores), 0) AS total_hores,
			COALESCE(SUM(CASE WHEN a.executor = 'jo' THEN r.hores ELSE 0 END), 0) AS hores_jo,
			COALESCE(SUM(CASE WHEN a.executor = 'equip' THEN r.hores ELSE 0 END), 0) AS hores_equip,
			COUNT(DISTINCT a.id) AS total_accions,
			COUNT(DISTINCT CASE WHEN a.estat = 'tancat' THEN a.id END) AS accions_tancades,
			COUNT(DISTINCT CASE WHEN a.estat != 'tancat' THEN a.id END) AS accions_en_curs
		FROM registres_diaris r
		JOIN accions a ON r.accio_id = a.id AND a.user_id = r.user_id
		LEFT JOIN iniciatives i ON a.iniciativa_id = i.id AND i.user_id = r.user_id
		LEFT JOIN objectius o ON i.objectiu_id = o.id AND o.user_id = r.user_id
		LEFT JOIN clients c ON (a.client_id = c.id OR o.client_id = c.id OR i.client_id = c.id) AND c.user_id = r.user_id
		WHERE r.user_id = $1 %s
	`, filterSQL)

	err := r.db.QueryRowContext(ctx, statsQuery, baseArgs...).Scan(
		&summary.TotalHores,
		&summary.HoresJo,
		&summary.HoresEquip,
		&summary.TotalAccions,
		&summary.AccionsTancades,
		&summary.AccionsEnCurs,
	)
	if err != nil {
		return nil, err
	}

	// 2. Dedicacio per client
	clientQuery := fmt.Sprintf(`
		SELECT 
			COALESCE(c.id::text, 'sense-client') AS client_id,
			COALESCE(c.nom, 'Sense Client') AS client_nom,
			COALESCE(SUM(r.hores), 0) AS hores
		FROM registres_diaris r
		JOIN accions a ON r.accio_id = a.id AND a.user_id = r.user_id
		LEFT JOIN iniciatives i ON a.iniciativa_id = i.id AND i.user_id = r.user_id
		LEFT JOIN objectius o ON i.objectiu_id = o.id AND o.user_id = r.user_id
		LEFT JOIN clients c ON (a.client_id = c.id OR o.client_id = c.id OR i.client_id = c.id) AND c.user_id = r.user_id
		WHERE r.user_id = $1 %s
		GROUP BY c.id, c.nom
		ORDER BY hores DESC
	`, filterSQL)

	rows, err := r.db.QueryContext(ctx, clientQuery, baseArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var g DedicacioGroup
		if err := rows.Scan(&g.ID, &g.Nom, &g.Hores); err != nil {
			return nil, err
		}
		if summary.TotalHores > 0 {
			g.Percentatge = (g.Hores / summary.TotalHores) * 100.0
		}
		summary.DedicacioClients = append(summary.DedicacioClients, g)
	}

	// 3. Dedicacio per objectiu
	objQuery := fmt.Sprintf(`
		SELECT 
			COALESCE(o.id::text, 'sense-objectiu') AS objectiu_id,
			COALESCE(o.nom, 'Tasques Ad-hoc / Sense Objectiu') AS objectiu_nom,
			COALESCE(SUM(r.hores), 0) AS hores
		FROM registres_diaris r
		JOIN accions a ON r.accio_id = a.id AND a.user_id = r.user_id
		LEFT JOIN iniciatives i ON a.iniciativa_id = i.id AND i.user_id = r.user_id
		LEFT JOIN objectius o ON i.objectiu_id = o.id AND o.user_id = r.user_id
		LEFT JOIN clients c ON (a.client_id = c.id OR o.client_id = c.id OR i.client_id = c.id) AND c.user_id = r.user_id
		WHERE r.user_id = $1 %s
		GROUP BY o.id, o.nom
		ORDER BY hores DESC
	`, filterSQL)

	objRows, err := r.db.QueryContext(ctx, objQuery, baseArgs...)
	if err != nil {
		return nil, err
	}
	defer objRows.Close()

	for objRows.Next() {
		var g DedicacioGroup
		if err := objRows.Scan(&g.ID, &g.Nom, &g.Hores); err != nil {
			return nil, err
		}
		if summary.TotalHores > 0 {
			g.Percentatge = (g.Hores / summary.TotalHores) * 100.0
		}
		summary.DedicacioObjectius = append(summary.DedicacioObjectius, g)
	}

	return summary, nil
}

func (r *repository) GetLogs(ctx context.Context, filter ReportFilter) ([]ReportLogRow, error) {
	filterSQL, args := r.buildFilterClauses(filter, 2)
	baseArgs := append([]interface{}{filter.UserID}, args...)

	query := fmt.Sprintf(`
		SELECT 
			r.id,
			r.data,
			a.id,
			a.nom,
			COALESCE(c.nom, '—') AS client_nom,
			COALESCE(o.nom, '—') AS objectiu_nom,
			COALESCE(i.nom, '—') AS iniciativa_nom,
			COALESCE(e.nom, '—') AS equip_nom,
			a.executor,
			r.hores,
			r.comentari
		FROM registres_diaris r
		JOIN accions a ON r.accio_id = a.id AND a.user_id = r.user_id
		LEFT JOIN iniciatives i ON a.iniciativa_id = i.id AND i.user_id = r.user_id
		LEFT JOIN objectius o ON i.objectiu_id = o.id AND o.user_id = r.user_id
		LEFT JOIN clients c ON (a.client_id = c.id OR o.client_id = c.id OR i.client_id = c.id) AND c.user_id = r.user_id
		LEFT JOIN equips e ON a.equip_id = e.id AND e.user_id = r.user_id
		WHERE r.user_id = $1 %s
		ORDER BY r.data DESC, r.created_at DESC
	`, filterSQL)

	rows, err := r.db.QueryContext(ctx, query, baseArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []ReportLogRow
	for rows.Next() {
		var row ReportLogRow
		var dateVal time.Time
		if err := rows.Scan(
			&row.RegistreID,
			&dateVal,
			&row.AccioID,
			&row.AccioNom,
			&row.ClientNom,
			&row.ObjectiuNom,
			&row.IniciativaNom,
			&row.EquipNom,
			&row.Executor,
			&row.Hores,
			&row.Comentari,
		); err != nil {
			return nil, err
		}
		row.Data = dateVal.Format("2006-01-02")
		logs = append(logs, row)
	}

	if logs == nil {
		logs = []ReportLogRow{}
	}

	return logs, nil
}
