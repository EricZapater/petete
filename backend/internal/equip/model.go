package equip

import (
	"time"

	"github.com/google/uuid"
)

type Equip struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	ClientID  uuid.UUID `json:"client_id"`
	Nom       string    `json:"nom"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateEquipRequest struct {
	ClientID uuid.UUID `json:"client_id" binding:"required"`
	Nom      string    `json:"nom" binding:"required,min=1,max=150"`
}

type UpdateEquipRequest struct {
	ClientID *uuid.UUID `json:"client_id,omitempty"`
	Nom      *string    `json:"nom,omitempty" binding:"omitempty,min=1,max=150"`
}
