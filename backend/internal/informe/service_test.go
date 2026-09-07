package informe

import (
	"context"
	"testing"

	"github.com/google/uuid"
)

type mockRepository struct {
	summary *ReportSummary
	logs    []ReportLogRow
	err     error
}

func (m *mockRepository) GetSummary(ctx context.Context, filter ReportFilter) (*ReportSummary, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.summary, nil
}

func (m *mockRepository) GetLogs(ctx context.Context, filter ReportFilter) ([]ReportLogRow, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.logs, nil
}

func TestGetSummary(t *testing.T) {
	expectedSummary := &ReportSummary{
		TotalHores:      10.5,
		TotalAccions:    5,
		AccionsTancades: 3,
		AccionsEnCurs:   2,
		HoresJo:         8.0,
		HoresEquip:      2.5,
	}
	mockRepo := &mockRepository{summary: expectedSummary}
	svc := NewService(mockRepo)

	userID := uuid.New()
	filter := ReportFilter{UserID: userID}

	summary, err := svc.GetSummary(context.Background(), filter)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if summary.TotalHores != 10.5 {
		t.Errorf("expected 10.5 hours, got %f", summary.TotalHores)
	}
	if summary.TotalAccions != 5 {
		t.Errorf("expected 5 actions, got %d", summary.TotalAccions)
	}
}

func TestExportExcel(t *testing.T) {
	logs := []ReportLogRow{
		{
			RegistreID:    uuid.New(),
			Data:          "2026-09-07",
			AccioID:       uuid.New(),
			AccioNom:      "Revisió d'arquitectura Cloud",
			ClientNom:     "Ajuntament de Barcelona",
			ObjectiuNom:   "Modernització Portal Ciutadà",
			IniciativaNom: "Sprint 1",
			EquipNom:      "Equip Web",
			Executor:      "jo",
			Hores:         3.5,
			Comentari:     "Validació d'endpoints",
		},
	}
	mockRepo := &mockRepository{logs: logs}
	svc := NewService(mockRepo)

	userID := uuid.New()
	filter := ReportFilter{UserID: userID}

	excelBytes, err := svc.ExportExcel(context.Background(), filter)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(excelBytes) < 4 {
		t.Fatalf("expected valid xlsx bytes, got length %d", len(excelBytes))
	}
	// Check XLSX / ZIP header magic numbers (PK..)
	if excelBytes[0] != 0x50 || excelBytes[1] != 0x4B {
		t.Errorf("invalid zip header: %x %x", excelBytes[0], excelBytes[1])
	}
}
