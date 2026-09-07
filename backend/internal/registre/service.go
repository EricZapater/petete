package registre

import (
	"context"
	"strings"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, userID uuid.UUID, accioID *uuid.UUID, dataStr *string) ([]RegistreDiari, error) {
	return s.repo.List(ctx, userID, accioID, dataStr)
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*RegistreDiari, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateRegistreDiariRequest) (*RegistreDiari, error) {
	rd := &RegistreDiari{
		UserID:    userID,
		AccioID:   req.AccioID,
		Data:      req.Data,
		Hores:     req.Hores,
		Comentari: strings.TrimSpace(req.Comentari),
	}

	if err := s.repo.Create(ctx, rd); err != nil {
		return nil, err
	}
	return rd, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateRegistreDiariRequest) (*RegistreDiari, error) {
	rd, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	if req.Data != nil {
		rd.Data = *req.Data
	}
	if req.Hores != nil {
		rd.Hores = *req.Hores
	}
	if req.Comentari != nil {
		rd.Comentari = strings.TrimSpace(*req.Comentari)
	}

	if err := s.repo.Update(ctx, rd); err != nil {
		return nil, err
	}
	return rd, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
