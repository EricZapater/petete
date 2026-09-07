package auth

import (
	"time"

	"github.com/google/uuid"
)

type Language string

const (
	LanguageCa Language = "ca"
	LanguageEs Language = "es"
	LanguageEn Language = "en"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Nom          string    `json:"nom"`
	Idioma       Language  `json:"idioma"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type RefreshToken struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	TokenHash string    `json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	Revoked   bool      `json:"revoked"`
	CreatedAt time.Time `json:"created_at"`
}

type RegisterRequest struct {
	Nom      string   `json:"nom" binding:"required,min=2,max=100"`
	Email    string   `json:"email" binding:"required,email"`
	Password string   `json:"password" binding:"required,min=8,max=128"`
	Idioma   Language `json:"idioma,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User        *User  `json:"user"`
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int64  `json:"expires_in"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int64  `json:"expires_in"`
}

type UpdateProfileRequest struct {
	Nom    *string   `json:"nom,omitempty" binding:"omitempty,min=2,max=100"`
	Idioma *Language `json:"idioma,omitempty" binding:"omitempty,oneof=ca es en"`
}
