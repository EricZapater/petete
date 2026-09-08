export interface SystemHealth {
  uptime_seconds: number;
  memory_alloc_mb: number;
  memory_total_alloc_mb: number;
  memory_sys_mb: number;
  num_goroutines: number;
  num_gc: number;
  db_open_connections: number;
  db_in_use_connections: number;
  db_idle_connections: number;
  db_wait_count: number;
}

export interface TopInitiativeKPI {
  name: string;
  client_name: string;
  total_hours: number;
  actions_count: number;
}

export interface TopClientKPI {
  name: string;
  total_hours: number;
  initiatives_count: number;
  actions_count: number;
}

export interface UsageMetrics {
  total_users_count: number;
  active_users_last_30_days_count: number;
  total_hours_tracked: number;
  hours_tracked_this_month: number;
  total_worklogs_count: number;
  total_actions_count: number;
  pending_actions_count: number;
  in_progress_actions_count: number;
  completed_actions_count: number;
  total_clients_count: number;
  active_clients_count: number;
  total_initiatives_count: number;
  total_objectives_count: number;
  total_notes_count: number;
  top_initiatives: TopInitiativeKPI[];
  top_clients: TopClientKPI[];
}

export interface EndpointLatencyKPI {
  method: string;
  path: string;
  requests_count: number;
  avg_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
  error_rate: number;
}

export interface ApiPerformanceMetrics {
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  total_requests: number;
  total_errors: number;
  error_rate: number;
  endpoints: EndpointLatencyKPI[];
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  action: string;
  module: string;
  endpoint: string;
  method: string;
  status_code: number;
  duration_ms: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogsPaginatedResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogFilters {
  page: number;
  pageSize: number;
  search: string;
  module: string;
  statusCode?: number;
}
