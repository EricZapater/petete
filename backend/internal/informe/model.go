package informe

import (
	"time"

	"github.com/google/uuid"
)

type DedicacioGroup struct {
	ID          string  `json:"id"`
	Nom         string  `json:"nom"`
	Hores       float64 `json:"hores"`
	Percentatge float64 `json:"percentatge"`
}

type ReportSummary struct {
	TotalHores         float64          `json:"total_hores"`
	TotalAccions       int              `json:"total_accions"`
	AccionsTancades    int              `json:"accions_tancades"`
	AccionsEnCurs      int              `json:"accions_en_curs"`
	HoresJo            float64          `json:"hores_jo"`
	HoresEquip         float64          `json:"hores_equip"`
	DedicacioClients   []DedicacioGroup `json:"dedicacio_clients"`
	DedicacioObjectius []DedicacioGroup `json:"dedicacio_objectius"`
}

type ReportLogRow struct {
	RegistreID    uuid.UUID `json:"registre_id"`
	Data          string    `json:"data"`
	AccioID       uuid.UUID `json:"accio_id"`
	AccioNom      string    `json:"accio_nom"`
	ClientNom     string    `json:"client_nom"`
	ObjectiuNom   string    `json:"objectiu_nom"`
	IniciativaNom string    `json:"iniciativa_nom"`
	EquipNom      string    `json:"equip_nom"`
	Executor      string    `json:"executor"`
	Hores         float64   `json:"hores"`
	Comentari     string    `json:"comentari"`
}

type ReportFilter struct {
	UserID       uuid.UUID
	DataInici    *time.Time
	DataFi       *time.Time
	ClientID     *uuid.UUID
	ObjectiuID   *uuid.UUID
	IniciativaID *uuid.UUID
	Executor     string
}
