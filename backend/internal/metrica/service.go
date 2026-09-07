package metrica

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

func (s *Service) List(ctx context.Context, userID uuid.UUID, iniciativaID *uuid.UUID) ([]Metrica, error) {
	return s.repo.List(ctx, userID, iniciativaID)
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*Metrica, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateMetricaRequest) (*Metrica, error) {
	m := &Metrica{
		UserID:        userID,
		IniciativaID:  req.IniciativaID,
		Nom:           strings.TrimSpace(req.Nom),
		Unitat:        strings.TrimSpace(req.Unitat),
		ValorObjectiu: req.ValorObjectiu,
		ValorActual:   req.ValorActual,
	}

	if err := s.repo.Create(ctx, m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateMetricaRequest) (*Metrica, error) {
	m, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	if req.Nom != nil {
		m.Nom = strings.TrimSpace(*req.Nom)
	}
	if req.Unitat != nil {
		m.Unitat = strings.TrimSpace(*req.Unitat)
	}
	if req.ValorObjectiu != nil {
		m.ValorObjectiu = *req.ValorObjectiu
	}
	if req.ValorActual != nil {
		m.ValorActual = *req.ValorActual
	}

	if err := s.repo.Update(ctx, m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
