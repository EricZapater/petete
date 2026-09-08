package nota

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

func (s *Service) List(ctx context.Context, userID uuid.UUID, clientID *uuid.UUID, search string) ([]Nota, error) {
	return s.repo.List(ctx, userID, clientID, strings.TrimSpace(search))
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*Nota, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateNotaRequest) (*Nota, error) {
	n := &Nota{
		UserID:    userID,
		ClientID:  req.ClientID,
		Titol:     strings.TrimSpace(req.Titol),
		Contingut: req.Contingut,
	}

	if err := s.repo.Create(ctx, n); err != nil {
		return nil, err
	}
	return n, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateNotaRequest) (*Nota, error) {
	n, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	if req.ClientID != nil {
		n.ClientID = req.ClientID
	}
	if req.Titol != nil {
		n.Titol = strings.TrimSpace(*req.Titol)
	}
	if req.Contingut != nil {
		n.Contingut = *req.Contingut
	}

	if err := s.repo.Update(ctx, n); err != nil {
		return nil, err
	}
	return n, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
