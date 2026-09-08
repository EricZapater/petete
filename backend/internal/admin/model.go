package admin

import "time"

type SystemHealth struct {
	UptimeSeconds        int64   `json:"uptime_seconds"`
	MemoryAllocMB        float64 `json:"memory_alloc_mb"`
	MemoryTotalAllocMB   float64 `json:"memory_total_alloc_mb"`
	MemorySysMB          float64 `json:"memory_sys_mb"`
	NumGoroutines        int     `json:"num_goroutines"`
	NumGC                uint32  `json:"num_gc"`
	DBOpenConnections    int     `json:"db_open_connections"`
	DBInUseConnections   int     `json:"db_in_use_connections"`
	DBIdleConnections    int     `json:"db_idle_connections"`
	DBWaitCount          int64   `json:"db_wait_count"`
}

type TopInitiativeKPI struct {
	Name         string  `json:"name"`
	ClientName   string  `json:"client_name"`
	TotalHours   float64 `json:"total_hours"`
	ActionsCount int     `json:"actions_count"`
}

type TopClientKPI struct {
	Name             string  `json:"name"`
	TotalHours       float64 `json:"total_hours"`
	InitiativesCount int     `json:"initiatives_count"`
	ActionsCount     int     `json:"actions_count"`
}

type UsageMetrics struct {
	TotalUsersCount            int                `json:"total_users_count"`
	ActiveUsersLast30DaysCount int                `json:"active_users_last_30_days_count"`
	TotalHoursTracked          float64            `json:"total_hours_tracked"`
	HoursTrackedThisMonth      float64            `json:"hours_tracked_this_month"`
	TotalWorklogsCount         int                `json:"total_worklogs_count"`
	TotalActionsCount          int                `json:"total_actions_count"`
	PendingActionsCount        int                `json:"pending_actions_count"`
	InProgressActionsCount     int                `json:"in_progress_actions_count"`
	CompletedActionsCount      int                `json:"completed_actions_count"`
	TotalClientsCount          int                `json:"total_clients_count"`
	ActiveClientsCount         int                `json:"active_clients_count"`
	TotalInitiativesCount      int                `json:"total_initiatives_count"`
	TotalObjectivesCount       int                `json:"total_objectives_count"`
	TotalNotesCount            int                `json:"total_notes_count"`
	TopInitiatives             []TopInitiativeKPI `json:"top_initiatives"`
	TopClients                 []TopClientKPI     `json:"top_clients"`
}

type EndpointLatencyKPI struct {
	Method        string  `json:"method"`
	Path          string  `json:"path"`
	RequestsCount int     `json:"requests_count"`
	AvgDurationMS float64 `json:"avg_duration_ms"`
	P95DurationMS float64 `json:"p95_duration_ms"`
	P99DurationMS float64 `json:"p99_duration_ms"`
	ErrorRate     float64 `json:"error_rate"`
}

type ApiPerformanceMetrics struct {
	AvgLatencyMS  float64              `json:"avg_latency_ms"`
	P95LatencyMS  float64              `json:"p95_latency_ms"`
	P99LatencyMS  float64              `json:"p99_latency_ms"`
	TotalRequests int                  `json:"total_requests"`
	TotalErrors   int                  `json:"total_errors"`
	ErrorRate     float64              `json:"error_rate"`
	Endpoints     []EndpointLatencyKPI `json:"endpoints"`
}

type AuditLogItem struct {
	ID         string    `json:"id"`
	UserID     *string   `json:"user_id,omitempty"`
	UserName   *string   `json:"user_name,omitempty"`
	UserEmail  *string   `json:"user_email,omitempty"`
	Action     string    `json:"action"`
	Module     string    `json:"module"`
	Endpoint   string    `json:"endpoint"`
	Method     string    `json:"method"`
	StatusCode int       `json:"status_code"`
	DurationMS int       `json:"duration_ms"`
	IPAddress  *string   `json:"ip_address,omitempty"`
	UserAgent  *string   `json:"user_agent,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type AuditLogsPaginatedResponse struct {
	Items      []AuditLogItem `json:"items"`
	Total      int            `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"pageSize"`
	TotalPages int            `json:"totalPages"`
}
