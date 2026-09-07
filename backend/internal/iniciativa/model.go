package iniciativa

import (
	"time"

	"github.com/google/uuid"
	"petete/backend/internal/objectiu"
)

type Iniciativa struct {
	ID                    uuid.UUID           `json:"id"`
	UserID                uuid.UUID           `json:"user_id"`
	ClientID              *uuid.UUID          `json:"client_id,omitempty"`
	ObjectiuID            *uuid.UUID          `json:"objectiu_id,omitempty"`
	Nom                   string              `json:"nom"`
	Estat                 objectiu.ItemStatus `json:"estat"`
	DataPrevistaTancament *string             `json:"data_prevista_tancament,omitempty"`
	CreatedAt             time.Time           `json:"created_at"`
	UpdatedAt             time.Time           `json:"updated_at"`
}

type CreateIniciativaRequest struct {
	ClientID              *uuid.UUID           `json:"client_id,omitempty"`
	ObjectiuID            *uuid.UUID           `json:"objectiu_id,omitempty"`
	Nom                   string               `json:"nom" binding:"required,min=1,max=200"`
	Estat                 *objectiu.ItemStatus `json:"estat,omitempty"`
	DataPrevistaTancament *string              `json:"data_prevista_tancament,omitempty"`
}

type UpdateIniciativaRequest struct {
	ClientID              *uuid.UUID           `json:"client_id,omitempty"`
	ObjectiuID            *uuid.UUID           `json:"objectiu_id,omitempty"`
	Nom                   *string              `json:"nom,omitempty" binding:"omitempty,min=1,max=200"`
	Estat                 *objectiu.ItemStatus `json:"estat,omitempty" binding:"omitempty,oneof=pendent en_curs bloquejat tancat"`
	DataPrevistaTancament *string              `json:"data_prevista_tancament,omitempty"`
}
