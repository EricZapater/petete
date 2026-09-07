package informe

import (
	"bytes"
	"context"
	"fmt"

	"github.com/xuri/excelize/v2"
)

type Service interface {
	GetSummary(ctx context.Context, filter ReportFilter) (*ReportSummary, error)
	GetLogs(ctx context.Context, filter ReportFilter) ([]ReportLogRow, error)
	ExportExcel(ctx context.Context, filter ReportFilter) ([]byte, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetSummary(ctx context.Context, filter ReportFilter) (*ReportSummary, error) {
	return s.repo.GetSummary(ctx, filter)
}

func (s *service) GetLogs(ctx context.Context, filter ReportFilter) ([]ReportLogRow, error) {
	return s.repo.GetLogs(ctx, filter)
}

func (s *service) ExportExcel(ctx context.Context, filter ReportFilter) ([]byte, error) {
	logs, err := s.repo.GetLogs(ctx, filter)
	if err != nil {
		return nil, err
	}

	f := excelize.NewFile()
	defer f.Close()

	sheetName := "Informe Petete"
	f.SetSheetName("Sheet1", sheetName)

	// Define styles
	headerStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold:  true,
			Color: "#FFFFFF",
			Size:  11,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#1976D2"},
			Pattern: 1,
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "#CCCCCC", Style: 1},
			{Type: "top", Color: "#CCCCCC", Style: 1},
			{Type: "bottom", Color: "#CCCCCC", Style: 1},
			{Type: "right", Color: "#CCCCCC", Style: 1},
		},
	})
	if err != nil {
		return nil, err
	}

	dataStyle, err := f.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "left", Color: "#E0E0E0", Style: 1},
			{Type: "top", Color: "#E0E0E0", Style: 1},
			{Type: "bottom", Color: "#E0E0E0", Style: 1},
			{Type: "right", Color: "#E0E0E0", Style: 1},
		},
		Alignment: &excelize.Alignment{
			Vertical: "center",
		},
	})
	if err != nil {
		return nil, err
	}

	hoursStyle, err := f.NewStyle(&excelize.Style{
		CustomNumFmt: &[]string{"0.00 \"h\""}[0],
		Alignment: &excelize.Alignment{
			Horizontal: "right",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "#E0E0E0", Style: 1},
			{Type: "top", Color: "#E0E0E0", Style: 1},
			{Type: "bottom", Color: "#E0E0E0", Style: 1},
			{Type: "right", Color: "#E0E0E0", Style: 1},
		},
	})
	if err != nil {
		return nil, err
	}

	totalStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 11,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#E3F2FD"},
			Pattern: 1,
		},
		Border: []excelize.Border{
			{Type: "top", Color: "#1976D2", Style: 2},
			{Type: "bottom", Color: "#1976D2", Style: 2},
		},
		Alignment: &excelize.Alignment{
			Vertical: "center",
		},
	})
	if err != nil {
		return nil, err
	}

	totalHoursStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 11,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#E3F2FD"},
			Pattern: 1,
		},
		CustomNumFmt: &[]string{"0.00 \"h\""}[0],
		Alignment: &excelize.Alignment{
			Horizontal: "right",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "top", Color: "#1976D2", Style: 2},
			{Type: "bottom", Color: "#1976D2", Style: 2},
		},
	})
	if err != nil {
		return nil, err
	}

	// Write Headers
	headers := []string{"Data", "Client", "Objectiu", "Iniciativa", "Acció", "Equip", "Executor", "Hores", "Comentari"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, h)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}

	f.SetRowHeight(sheetName, 1, 28)

	var totalHores float64
	rowNum := 2
	for _, l := range logs {
		executorLabel := "Jo"
		if l.Executor == "equip" {
			executorLabel = "Equip"
		}

		f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), l.Data)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowNum), l.ClientNom)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowNum), l.ObjectiuNom)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowNum), l.IniciativaNom)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowNum), l.AccioNom)
		f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowNum), l.EquipNom)
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", rowNum), executorLabel)
		f.SetCellValue(sheetName, fmt.Sprintf("H%d", rowNum), l.Hores)
		f.SetCellValue(sheetName, fmt.Sprintf("I%d", rowNum), l.Comentari)

		for col := 1; col <= 9; col++ {
			c, _ := excelize.CoordinatesToCellName(col, rowNum)
			if col == 8 {
				f.SetCellStyle(sheetName, c, c, hoursStyle)
			} else {
				f.SetCellStyle(sheetName, c, c, dataStyle)
			}
		}

		totalHores += l.Hores
		rowNum++
	}

	// Summary Row
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), "TOTAL")
	f.SetCellValue(sheetName, fmt.Sprintf("H%d", rowNum), totalHores)
	for col := 1; col <= 9; col++ {
		c, _ := excelize.CoordinatesToCellName(col, rowNum)
		if col == 8 {
			f.SetCellStyle(sheetName, c, c, totalHoursStyle)
		} else {
			f.SetCellStyle(sheetName, c, c, totalStyle)
		}
	}
	f.SetRowHeight(sheetName, rowNum, 24)

	// Set column widths
	f.SetColWidth(sheetName, "A", "A", 14)
	f.SetColWidth(sheetName, "B", "B", 26)
	f.SetColWidth(sheetName, "C", "C", 26)
	f.SetColWidth(sheetName, "D", "D", 26)
	f.SetColWidth(sheetName, "E", "E", 32)
	f.SetColWidth(sheetName, "F", "F", 18)
	f.SetColWidth(sheetName, "G", "G", 14)
	f.SetColWidth(sheetName, "H", "H", 14)
	f.SetColWidth(sheetName, "I", "I", 45)

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
