package admin

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"runtime"
	"strconv"
	"time"
)

var startTime = time.Now()

type Service interface {
	GetSystemHealth(ctx context.Context) *SystemHealth
	GetUsageMetrics(ctx context.Context) (*UsageMetrics, error)
	GetApiPerformanceMetrics(ctx context.Context) (*ApiPerformanceMetrics, error)
	GetAuditLogs(ctx context.Context, page, pageSize int, search, module string, statusCode *int) (*AuditLogsPaginatedResponse, error)
	ExportAuditLogsCSV(ctx context.Context, search, module string, statusCode *int) ([]byte, error)
	LogAuditItem(item *AuditLogItem)
	Stop()
}

type service struct {
	repo      Repository
	logChan   chan *AuditLogItem
	stopChan  chan struct{}
}

func NewService(repo Repository) Service {
	s := &service{
		repo:     repo,
		logChan:  make(chan *AuditLogItem, 1000),
		stopChan: make(chan struct{}),
	}
	go s.worker()
	return s
}

func (s *service) worker() {
	for {
		select {
		case item := <-s.logChan:
			if item != nil {
				ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
				if err := s.repo.SaveAuditLog(ctx, item); err != nil {
					log.Printf("Admin audit log worker error: %v", err)
				}
				cancel()
			}
		case <-s.stopChan:
			return
		}
	}
}

func (s *service) Stop() {
	close(s.stopChan)
}

func (s *service) LogAuditItem(item *AuditLogItem) {
	select {
	case s.logChan <- item:
	default:
		log.Printf("Admin audit log channel full, dropping log for %s %s", item.Method, item.Endpoint)
	}
}

func (s *service) GetSystemHealth(ctx context.Context) *SystemHealth {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	open, inUse, idle, waitCount := s.repo.GetDBStats()

	return &SystemHealth{
		UptimeSeconds:      int64(time.Since(startTime).Seconds()),
		MemoryAllocMB:      float64(m.Alloc) / 1024 / 1024,
		MemoryTotalAllocMB: float64(m.TotalAlloc) / 1024 / 1024,
		MemorySysMB:        float64(m.Sys) / 1024 / 1024,
		NumGoroutines:      runtime.NumGoroutine(),
		NumGC:              m.NumGC,
		DBOpenConnections:  open,
		DBInUseConnections: inUse,
		DBIdleConnections:  idle,
		DBWaitCount:        waitCount,
	}
}

func (s *service) GetUsageMetrics(ctx context.Context) (*UsageMetrics, error) {
	return s.repo.GetUsageMetrics(ctx)
}

func (s *service) GetApiPerformanceMetrics(ctx context.Context) (*ApiPerformanceMetrics, error) {
	return s.repo.GetApiPerformanceMetrics(ctx)
}

func (s *service) GetAuditLogs(ctx context.Context, page, pageSize int, search, module string, statusCode *int) (*AuditLogsPaginatedResponse, error) {
	return s.repo.GetAuditLogs(ctx, page, pageSize, search, module, statusCode)
}

func (s *service) ExportAuditLogsCSV(ctx context.Context, search, module string, statusCode *int) ([]byte, error) {
	items, err := s.repo.ExportAuditLogs(ctx, search, module, statusCode)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)

	// Headers
	if err := w.Write([]string{
		"ID", "Data/Hora", "Usuari", "Email", "Acció", "Mòdul", "Endpoint", "Mètode", "Estat HTTP", "Durada (ms)", "IP", "User Agent",
	}); err != nil {
		return nil, fmt.Errorf("error writing csv header: %w", err)
	}

	for _, it := range items {
		userName := ""
		if it.UserName != nil {
			userName = *it.UserName
		}
		userEmail := ""
		if it.UserEmail != nil {
			userEmail = *it.UserEmail
		}
		ip := ""
		if it.IPAddress != nil {
			ip = *it.IPAddress
		}
		ua := ""
		if it.UserAgent != nil {
			ua = *it.UserAgent
		}

		record := []string{
			it.ID,
			it.CreatedAt.Format(time.RFC3339),
			userName,
			userEmail,
			it.Action,
			it.Module,
			it.Endpoint,
			it.Method,
			strconv.Itoa(it.StatusCode),
			strconv.Itoa(it.DurationMS),
			ip,
			ua,
		}
		if err := w.Write(record); err != nil {
			return nil, fmt.Errorf("error writing csv record: %w", err)
		}
	}

	w.Flush()
	if err := w.Error(); err != nil {
		return nil, fmt.Errorf("error flushing csv buffer: %w", err)
	}

	return buf.Bytes(), nil
}
