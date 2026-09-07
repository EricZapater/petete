package iniciativa

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"petete/backend/internal/objectiu"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, userID uuid.UUID, clientID, objectiuID *uuid.UUID, estat *objectiu.ItemStatus) ([]Iniciativa, error) {
	return s.repo.List(ctx, userID, clientID, objectiuID, estat)
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*Iniciativa, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateIniciativaRequest) (*Iniciativa, error) {
	estat := objectiu.StatusPendent
	if req.Estat != nil {
		estat = *req.Estat
	}

	i := &Iniciativa{
		UserID:                userID,
		ClientID:              req.ClientID,
		ObjectiuID:            req.ObjectiuID,
		Nom:                   strings.TrimSpace(req.Nom),
		Estat:                 estat,
		DataPrevistaTancament: req.DataPrevistaTancament,
	}

	if err := s.repo.Create(ctx, i); err != nil {
		return nil, err
	}
	return i, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateIniciativaRequest) (*Iniciativa, error) {
	i, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	if req.ClientID != nil {
		i.ClientID = req.ClientID
	}
	// Note: allow setting ObjectiuID to a new value or to nil
	if req.ObjectiuID != nil {
		i.ObjectiuID = req.ObjectiuID
	}
	if req.Nom != nil {
		i.Nom = strings.TrimSpace(*req.Nom)
	}
	if req.Estat != nil {
		i.Estat = *req.Estat
	}
	if req.DataPrevistaTancament != nil {
		i.DataPrevistaTancament = req.DataPrevistaTancament
	}

	if err := s.repo.Update(ctx, i); err != nil {
		return nil, err
	}
	return i, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
