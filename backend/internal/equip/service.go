package equip

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

func (s *Service) List(ctx context.Context, userID uuid.UUID, clientID *uuid.UUID) ([]Equip, error) {
	return s.repo.List(ctx, userID, clientID)
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*Equip, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateEquipRequest) (*Equip, error) {
	e := &Equip{
		UserID:   userID,
		ClientID: req.ClientID,
		Nom:      strings.TrimSpace(req.Nom),
	}

	if err := s.repo.Create(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateEquipRequest) (*Equip, error) {
	e, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	if req.ClientID != nil {
		e.ClientID = *req.ClientID
	}
	if req.Nom != nil {
		e.Nom = strings.TrimSpace(*req.Nom)
	}

	if err := s.repo.Update(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
