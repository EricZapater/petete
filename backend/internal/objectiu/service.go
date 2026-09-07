package objectiu

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

func (s *Service) List(ctx context.Context, userID uuid.UUID, clientID *uuid.UUID, estat *ItemStatus) ([]Objectiu, error) {
	return s.repo.List(ctx, userID, clientID, estat)
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*Objectiu, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateObjectiuRequest) (*Objectiu, error) {
	estat := StatusPendent
	if req.Estat != nil {
		estat = *req.Estat
	}

	o := &Objectiu{
		UserID:                userID,
		ClientID:              req.ClientID,
		Nom:                   strings.TrimSpace(req.Nom),
		Descripcio:            req.Descripcio,
		Estat:                 estat,
		DataPrevistaTancament: req.DataPrevistaTancament,
	}

	if err := s.repo.Create(ctx, o); err != nil {
		return nil, err
	}
	return o, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateObjectiuRequest) (*Objectiu, error) {
	o, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	if req.ClientID != nil {
		o.ClientID = *req.ClientID
	}
	if req.Nom != nil {
		o.Nom = strings.TrimSpace(*req.Nom)
	}
	if req.Descripcio != nil {
		o.Descripcio = req.Descripcio
	}
	if req.Estat != nil {
		o.Estat = *req.Estat
	}
	if req.DataPrevistaTancament != nil {
		o.DataPrevistaTancament = req.DataPrevistaTancament
	}

	if err := s.repo.Update(ctx, o); err != nil {
		return nil, err
	}
	return o, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
