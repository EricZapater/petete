package objectiu

import (
	"time"

	"github.com/google/uuid"
)

type ItemStatus string

const (
	StatusPendent   ItemStatus = "pendent"
	StatusEnCurs    ItemStatus = "en_curs"
	StatusBloquejat ItemStatus = "bloquejat"
	StatusTancat    ItemStatus = "tancat"
)

type Objectiu struct {
	ID                    uuid.UUID  `json:"id"`
	UserID                uuid.UUID  `json:"user_id"`
	ClientID              uuid.UUID  `json:"client_id"`
	Nom                   string     `json:"nom"`
	Descripcio            *string    `json:"descripcio,omitempty"`
	Estat                 ItemStatus `json:"estat"`
	DataPrevistaTancament *string    `json:"data_prevista_tancament,omitempty"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

type CreateObjectiuRequest struct {
	ClientID              uuid.UUID   `json:"client_id" binding:"required"`
	Nom                   string      `json:"nom" binding:"required,min=1,max=200"`
	Descripcio            *string     `json:"descripcio,omitempty"`
	Estat                 *ItemStatus `json:"estat,omitempty"`
	DataPrevistaTancament *string     `json:"data_prevista_tancament,omitempty"`
}

type UpdateObjectiuRequest struct {
	ClientID              *uuid.UUID  `json:"client_id,omitempty"`
	Nom                   *string     `json:"nom,omitempty" binding:"omitempty,min=1,max=200"`
	Descripcio            *string     `json:"descripcio,omitempty"`
	Estat                 *ItemStatus `json:"estat,omitempty" binding:"omitempty,oneof=pendent en_curs bloquejat tancat"`
	DataPrevistaTancament *string     `json:"data_prevista_tancament,omitempty"`
}
