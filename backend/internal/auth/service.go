package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"petete/backend/internal/shared"
)

type Service struct {
	repo       *Repository
	jwtManager *shared.JWTManager
}

func NewService(repo *Repository, jwtManager *shared.JWTManager) *Service {
	return &Service{
		repo:       repo,
		jwtManager: jwtManager,
	}
}

func (s *Service) hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func (s *Service) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, string, error) {
	email := strings.TrimSpace(strings.ToLower(req.Email))

	// Check if already exists
	existingUser, err := s.repo.GetUserByEmail(ctx, email)
	if err == nil && existingUser != nil {
		return nil, "", shared.ErrUserAlreadyExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	idioma := req.Idioma
	if idioma == "" {
		idioma = LanguageCa
	}

	user := &User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		Nom:          strings.TrimSpace(req.Nom),
		Idioma:       idioma,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, "", err
	}

	// Generate Tokens
	accessToken, expiresIn, err := s.jwtManager.GenerateAccessToken(user.ID, user.Email, string(user.Idioma))
	if err != nil {
		return nil, "", err
	}

	rawRefreshToken, expiresAt, err := s.jwtManager.GenerateRefreshToken()
	if err != nil {
		return nil, "", err
	}

	rt := &RefreshToken{
		UserID:    user.ID,
		TokenHash: s.hashToken(rawRefreshToken),
		ExpiresAt: expiresAt,
	}
	if err := s.repo.CreateRefreshToken(ctx, rt); err != nil {
		return nil, "", err
	}

	return &AuthResponse{
		User:        user,
		AccessToken: accessToken,
		TokenType:   "Bearer",
		ExpiresIn:   expiresIn,
	}, rawRefreshToken, nil
}

func (s *Service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, string, error) {
	email := strings.TrimSpace(strings.ToLower(req.Email))

	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, "", shared.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", shared.ErrInvalidCredentials
	}

	// Generate Tokens
	accessToken, expiresIn, err := s.jwtManager.GenerateAccessToken(user.ID, user.Email, string(user.Idioma))
	if err != nil {
		return nil, "", err
	}

	rawRefreshToken, expiresAt, err := s.jwtManager.GenerateRefreshToken()
	if err != nil {
		return nil, "", err
	}

	rt := &RefreshToken{
		UserID:    user.ID,
		TokenHash: s.hashToken(rawRefreshToken),
		ExpiresAt: expiresAt,
	}
	if err := s.repo.CreateRefreshToken(ctx, rt); err != nil {
		return nil, "", err
	}

	return &AuthResponse{
		User:        user,
		AccessToken: accessToken,
		TokenType:   "Bearer",
		ExpiresIn:   expiresIn,
	}, rawRefreshToken, nil
}

func (s *Service) RefreshToken(ctx context.Context, rawRefreshToken string) (*TokenResponse, error) {
	if rawRefreshToken == "" {
		return nil, shared.ErrInvalidToken
	}

	tokenHash := s.hashToken(rawRefreshToken)
	rt, err := s.repo.GetRefreshToken(ctx, tokenHash)
	if err != nil {
		return nil, shared.ErrInvalidToken
	}

	if rt.Revoked || time.Now().UTC().After(rt.ExpiresAt) {
		return nil, shared.ErrInvalidToken
	}

	user, err := s.repo.GetUserByID(ctx, rt.UserID)
	if err != nil {
		return nil, shared.ErrInvalidToken
	}

	accessToken, expiresIn, err := s.jwtManager.GenerateAccessToken(user.ID, user.Email, string(user.Idioma))
	if err != nil {
		return nil, err
	}

	return &TokenResponse{
		AccessToken: accessToken,
		TokenType:   "Bearer",
		ExpiresIn:   expiresIn,
	}, nil
}

func (s *Service) Logout(ctx context.Context, rawRefreshToken string) error {
	if rawRefreshToken != "" {
		tokenHash := s.hashToken(rawRefreshToken)
		_ = s.repo.RevokeRefreshToken(ctx, tokenHash)
	}
	return nil
}

func (s *Service) GetProfile(ctx context.Context, userID uuid.UUID) (*User, error) {
	return s.repo.GetUserByID(ctx, userID)
}

func (s *Service) UpdateProfile(ctx context.Context, userID uuid.UUID, req UpdateProfileRequest) (*User, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if req.Nom != nil {
		user.Nom = strings.TrimSpace(*req.Nom)
	}
	if req.Idioma != nil {
		user.Idioma = *req.Idioma
	}

	if err := s.repo.UpdateUser(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}
