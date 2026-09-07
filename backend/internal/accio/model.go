package accio

import (
	"time"

	"github.com/google/uuid"
	"petete/backend/internal/objectiu"
	"petete/backend/internal/registre"
)

type ExecutorType string

const (
	ExecutorJo    ExecutorType = "jo"
	ExecutorEquip ExecutorType = "equip"
)

type Accio struct {
	ID                    uuid.UUID           `json:"id"`
	UserID                uuid.UUID           `json:"user_id"`
	ClientID              uuid.UUID           `json:"client_id"`
	IniciativaID          *uuid.UUID          `json:"iniciativa_id,omitempty"`
	EquipID               *uuid.UUID          `json:"equip_id,omitempty"`
	Executor              ExecutorType        `json:"executor"`
	Nom                   string              `json:"nom"`
	Etiquetes             []string            `json:"etiquetes"`
	Estat                 objectiu.ItemStatus `json:"estat"`
	DataPrevistaTancament *string             `json:"data_prevista_tancament,omitempty"`
	CreatedAt             time.Time           `json:"created_at"`
	UpdatedAt             time.Time           `json:"updated_at"`
}

type AccioWithStats struct {
	Accio
	TotalHores      float64                 `json:"total_hores"`
	ClientNom       string                  `json:"client_nom"`
	IniciativaNom   *string                 `json:"iniciativa_nom,omitempty"`
	EquipNom        *string                 `json:"equip_nom,omitempty"`
	RecentRegistres []registre.RegistreDiari `json:"recent_registres"`
}

type CreateAccioRequest struct {
	Nom                   string               `json:"nom" binding:"required,min=1,max=250"`
	ClientID              *uuid.UUID           `json:"client_id,omitempty"`
	IniciativaID          *uuid.UUID           `json:"iniciativa_id,omitempty"`
	EquipID               *uuid.UUID           `json:"equip_id,omitempty"`
	Executor              *ExecutorType        `json:"executor,omitempty"`
	Etiquetes             []string             `json:"etiquetes,omitempty"`
	Estat                 *objectiu.ItemStatus `json:"estat,omitempty"`
	DataPrevistaTancament *string              `json:"data_prevista_tancament,omitempty"`
}

type UpdateAccioRequest struct {
	Nom                   *string              `json:"nom,omitempty" binding:"omitempty,min=1,max=250"`
	ClientID              *uuid.UUID           `json:"client_id,omitempty"`
	IniciativaID          *uuid.UUID           `json:"iniciativa_id,omitempty"`
	EquipID               *uuid.UUID           `json:"equip_id,omitempty"`
	Executor              *ExecutorType        `json:"executor,omitempty"`
	Etiquetes             []string             `json:"etiquetes,omitempty"`
	Estat                 *objectiu.ItemStatus `json:"estat,omitempty" binding:"omitempty,oneof=pendent en_curs bloquejat tancat"`
	DataPrevistaTancament *string              `json:"data_prevista_tancament,omitempty"`
}
