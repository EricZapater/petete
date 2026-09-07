package metrica

import (
	"time"

	"github.com/google/uuid"
)

type Metrica struct {
	ID            uuid.UUID `json:"id"`
	UserID        uuid.UUID `json:"user_id"`
	IniciativaID  uuid.UUID `json:"iniciativa_id"`
	Nom           string    `json:"nom"`
	Unitat        string    `json:"unitat"`
	ValorObjectiu float64   `json:"valor_objectiu"`
	ValorActual   float64   `json:"valor_actual"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateMetricaRequest struct {
	IniciativaID  uuid.UUID `json:"iniciativa_id" binding:"required"`
	Nom           string    `json:"nom" binding:"required,min=1,max=150"`
	Unitat        string    `json:"unitat" binding:"required"`
	ValorObjectiu float64   `json:"valor_objectiu"`
	ValorActual   float64   `json:"valor_actual"`
}

type UpdateMetricaRequest struct {
	Nom           *string  `json:"nom,omitempty" binding:"omitempty,min=1,max=150"`
	Unitat        *string  `json:"unitat,omitempty"`
	ValorObjectiu *float64 `json:"valor_objectiu,omitempty"`
	ValorActual   *float64 `json:"valor_actual,omitempty"`
}
