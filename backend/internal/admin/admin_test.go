package admin

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"petete/backend/internal/shared"
)

type mockRepo struct {
	usageMetrics   *UsageMetrics
	apiMetrics     *ApiPerformanceMetrics
	auditLogsResp  *AuditLogsPaginatedResponse
	exportLogs     []AuditLogItem
	savedItems     []*AuditLogItem
	openConn       int
	inUseConn      int
	idleConn       int
	waitCount      int64
}

func (m *mockRepo) GetUsageMetrics(ctx context.Context) (*UsageMetrics, error) {
	if m.usageMetrics != nil {
		return m.usageMetrics, nil
	}
	return &UsageMetrics{
		TotalUsersCount:   5,
		TotalHoursTracked: 120.5,
	}, nil
}

func (m *mockRepo) GetApiPerformanceMetrics(ctx context.Context) (*ApiPerformanceMetrics, error) {
	if m.apiMetrics != nil {
		return m.apiMetrics, nil
	}
	return &ApiPerformanceMetrics{
		AvgLatencyMS:  15.4,
		P95LatencyMS:  45.2,
		TotalRequests: 100,
	}, nil
}

func (m *mockRepo) GetAuditLogs(ctx context.Context, page, pageSize int, search, module string, statusCode *int) (*AuditLogsPaginatedResponse, error) {
	if m.auditLogsResp != nil {
		return m.auditLogsResp, nil
	}
	return &AuditLogsPaginatedResponse{
		Items:      []AuditLogItem{},
		Total:      0,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: 0,
	}, nil
}

func (m *mockRepo) ExportAuditLogs(ctx context.Context, search, module string, statusCode *int) ([]AuditLogItem, error) {
	if m.exportLogs != nil {
		return m.exportLogs, nil
	}
	uEmail := "hola@ericzapater.cat"
	uName := "Eric Zapater"
	ip := "127.0.0.1"
	ua := "Go-Test"
	return []AuditLogItem{
		{
			ID:         "test-id-1",
			UserEmail:  &uEmail,
			UserName:   &uName,
			Action:     "GET /api/v1/admin/health",
			Module:     "admin",
			Endpoint:   "/api/v1/admin/health",
			Method:     "GET",
			StatusCode: 200,
			DurationMS: 12,
			IPAddress:  &ip,
			UserAgent:  &ua,
			CreatedAt:  time.Now(),
		},
	}, nil
}

func (m *mockRepo) SaveAuditLog(ctx context.Context, item *AuditLogItem) error {
	m.savedItems = append(m.savedItems, item)
	return nil
}

func (m *mockRepo) GetDBStats() (open, inUse, idle int, waitCount int64) {
	return m.openConn, m.inUseConn, m.idleConn, m.waitCount
}

func TestRequireAdminEmailMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		email := c.GetHeader("X-Test-Email")
		if email != "" {
			c.Set(shared.ContextEmailKey, email)
			c.Set(shared.ContextUserIDKey, uuid.New())
		}
		c.Next()
	})

	r.GET("/test-admin", RequireAdminEmail(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// 1. Non-admin email -> 403 Forbidden
	req1, _ := http.NewRequest(http.MethodGet, "/test-admin", nil)
	req1.Header.Set("X-Test-Email", "user@example.com")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	if w1.Code != http.StatusForbidden {
		t.Fatalf("S'esperava 403 Forbidden per a usuari no admin, obtingut %d", w1.Code)
	}

	// 2. Unauthenticated (no email) -> 403 Forbidden
	req2, _ := http.NewRequest(http.MethodGet, "/test-admin", nil)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusForbidden {
		t.Fatalf("S'esperava 403 Forbidden per a petició anònima, obtingut %d", w2.Code)
	}

	// 3. Admin email (hola@ericzapater.cat) -> 200 OK
	req3, _ := http.NewRequest(http.MethodGet, "/test-admin", nil)
	req3.Header.Set("X-Test-Email", "hola@ericzapater.cat")
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	if w3.Code != http.StatusOK {
		t.Fatalf("S'esperava 200 OK per a hola@ericzapater.cat, obtingut %d", w3.Code)
	}
}

func TestAdminHandlerEndpoints(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mock := &mockRepo{
		openConn:  10,
		inUseConn: 2,
		idleConn:  8,
	}
	svc := NewService(mock)
	defer svc.Stop()
	handler := NewHandler(svc)

	r := gin.New()
	v1 := r.Group("/api/v1")

	authMiddleware := func(c *gin.Context) {
		c.Set(shared.ContextEmailKey, AdminEmail)
		c.Set(shared.ContextUserIDKey, uuid.New())
		c.Next()
	}
	adminMiddleware := RequireAdminEmail()

	handler.RegisterRoutes(v1, authMiddleware, adminMiddleware)

	// Test GET /health
	reqH, _ := http.NewRequest(http.MethodGet, "/api/v1/admin/health", nil)
	wH := httptest.NewRecorder()
	r.ServeHTTP(wH, reqH)
	if wH.Code != http.StatusOK {
		t.Fatalf("S'esperava 200 a /admin/health, obtingut %d", wH.Code)
	}
	var healthResp struct {
		Data SystemHealth `json:"data"`
	}
	if err := json.Unmarshal(wH.Body.Bytes(), &healthResp); err != nil {
		t.Fatalf("Error deserialitzant health response: %v", err)
	}
	if healthResp.Data.DBOpenConnections != 10 {
		t.Fatalf("DBOpenConnections esperat 10, obtingut %d", healthResp.Data.DBOpenConnections)
	}

	// Test GET /metrics/usage
	reqU, _ := http.NewRequest(http.MethodGet, "/api/v1/admin/metrics/usage", nil)
	wU := httptest.NewRecorder()
	r.ServeHTTP(wU, reqU)
	if wU.Code != http.StatusOK {
		t.Fatalf("S'esperava 200 a /admin/metrics/usage, obtingut %d", wU.Code)
	}

	// Test GET /audit-logs/export
	reqE, _ := http.NewRequest(http.MethodGet, "/api/v1/admin/audit-logs/export", nil)
	wE := httptest.NewRecorder()
	r.ServeHTTP(wE, reqE)
	if wE.Code != http.StatusOK {
		t.Fatalf("S'esperava 200 a /admin/audit-logs/export, obtingut %d", wE.Code)
	}
	csvBody := wE.Body.String()
	if !strings.Contains(csvBody, "hola@ericzapater.cat") || !strings.Contains(csvBody, "Endpoint") {
		t.Fatalf("El contingut CSV no és correcte: %s", csvBody)
	}
}
