package registre

import (
	"time"

	"github.com/google/uuid"
)

type RegistreDiari struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	AccioID   uuid.UUID `json:"accio_id"`
	Data      string    `json:"data"` // YYYY-MM-DD
	Hores     float64   `json:"hores"`
	Comentari string    `json:"comentari"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateRegistreDiariRequest struct {
	AccioID   uuid.UUID `json:"accio_id" binding:"required"`
	Data      string    `json:"data" binding:"required"`
	Hores     float64   `json:"hores" binding:"required,gt=0,lte=24"`
	Comentari string    `json:"comentari"`
}

type UpdateRegistreDiariRequest struct {
	Data      *string  `json:"data,omitempty"`
	Hores     *float64 `json:"hores,omitempty" binding:"omitempty,gt=0,lte=24"`
	Comentari *string  `json:"comentari,omitempty"`
}
