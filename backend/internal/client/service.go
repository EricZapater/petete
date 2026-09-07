package client

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

func (s *Service) List(ctx context.Context, userID uuid.UUID, actiu *bool) ([]Client, error) {
	return s.repo.List(ctx, userID, actiu)
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*Client, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateClientRequest) (*Client, error) {
	actiu := true
	if req.Actiu != nil {
		actiu = *req.Actiu
	}

	c := &Client{
		UserID: userID,
		Nom:    strings.TrimSpace(req.Nom),
		Actiu:  actiu,
	}

	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateClientRequest) (*Client, error) {
	c, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	if req.Nom != nil {
		c.Nom = strings.TrimSpace(*req.Nom)
	}
	if req.Actiu != nil {
		c.Actiu = *req.Actiu
	}

	if err := s.repo.Update(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
