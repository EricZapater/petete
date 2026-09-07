package auth

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"petete/backend/internal/shared"
)

func TestJWTManager(t *testing.T) {
	jwtManager := shared.NewJWTManager("test-secret-key-12345678901234567890", 15*time.Minute, 7*24*time.Hour)

	userID := uuid.New()
	email := "test@example.com"
	idioma := "ca"

	token, exp, err := jwtManager.GenerateAccessToken(userID, email, idioma)
	if err != nil {
		t.Fatalf("Error generant access token: %v", err)
	}
	if token == "" || exp <= 0 {
		t.Fatalf("Token buit o expiració invàlida")
	}

	claims, err := jwtManager.ValidateToken(token)
	if err != nil {
		t.Fatalf("Error validant token: %v", err)
	}
	if claims.UserID != userID || claims.Email != email || claims.Idioma != idioma {
		t.Fatalf("Els claims no coincideixen: obtingut %+v", claims)
	}
}

func TestTokenHashAndRefreshGeneration(t *testing.T) {
	jwtManager := shared.NewJWTManager("test-secret-key-12345678901234567890", 15*time.Minute, 7*24*time.Hour)
	service := NewService(nil, jwtManager)

	token, expiresAt, err := jwtManager.GenerateRefreshToken()
	if err != nil {
		t.Fatalf("Error generant refresh token: %v", err)
	}
	if token == "" || expiresAt.Before(time.Now()) {
		t.Fatalf("Refresh token invàlid o data d'expiració incorrecta")
	}

	hash1 := service.hashToken(token)
	hash2 := service.hashToken(token)
	if hash1 == "" || hash1 != hash2 {
		t.Fatalf("El càlcul del hash de token és inconsistent")
	}
}
