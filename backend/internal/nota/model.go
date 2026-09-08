package nota

import (
	"time"

	"github.com/google/uuid"
)

type Nota struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	ClientID  *uuid.UUID `json:"client_id,omitempty"`
	Titol     string     `json:"titol"`
	Contingut string     `json:"contingut"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type CreateNotaRequest struct {
	ClientID  *uuid.UUID `json:"client_id,omitempty"`
	Titol     string     `json:"titol" binding:"required,min=1,max=250"`
	Contingut string     `json:"contingut"`
}

type UpdateNotaRequest struct {
	ClientID  *uuid.UUID `json:"client_id,omitempty"`
	Titol     *string    `json:"titol,omitempty" binding:"omitempty,min=1,max=250"`
	Contingut *string    `json:"contingut,omitempty"`
}
