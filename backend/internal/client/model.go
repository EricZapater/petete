package client

import (
	"time"

	"github.com/google/uuid"
)

type Client struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Nom       string    `json:"nom"`
	Actiu     bool      `json:"actiu"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateClientRequest struct {
	Nom   string `json:"nom" binding:"required,min=1,max=150"`
	Actiu *bool  `json:"actiu,omitempty"`
}

type UpdateClientRequest struct {
	Nom   *string `json:"nom,omitempty" binding:"omitempty,min=1,max=150"`
	Actiu *bool   `json:"actiu,omitempty"`
}
