package accio

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"petete/backend/internal/objectiu"
	"petete/backend/internal/registre"
	"petete/backend/internal/shared"
)

type Service struct {
	repo         *Repository
	registreRepo *registre.Repository
}

func NewService(repo *Repository, registreRepo *registre.Repository) *Service {
	return &Service{
		repo:         repo,
		registreRepo: registreRepo,
	}
}

func (s *Service) List(ctx context.Context, userID uuid.UUID, openOnly bool, clientID, iniciativaID *uuid.UUID, executor *ExecutorType) ([]AccioWithStats, error) {
	accions, err := s.repo.List(ctx, userID, openOnly, clientID, iniciativaID, executor)
	if err != nil {
		return nil, err
	}

	// Fetch recent daily logs for each action
	for idx := range accions {
		recent, err := s.registreRepo.List(ctx, userID, &accions[idx].ID, nil)
		if err == nil {
			if len(recent) > 3 {
				accions[idx].RecentRegistres = recent[:3]
			} else {
				accions[idx].RecentRegistres = recent
			}
		}
	}

	return accions, nil
}

func (s *Service) GetByID(ctx context.Context, userID, id uuid.UUID) (*AccioWithStats, error) {
	aws, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	allLogs, err := s.registreRepo.List(ctx, userID, &id, nil)
	if err == nil {
		aws.RecentRegistres = allLogs
	}

	return aws, nil
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req CreateAccioRequest) (*Accio, error) {
	// Regla 1: Si iniciativa_id és nil, client_id és obligatori
	if req.IniciativaID == nil && req.ClientID == nil {
		return nil, shared.NewBadRequestError("El client_id és obligatori per a accions sense iniciativa (Regla 1)")
	}

	if req.ClientID == nil {
		return nil, shared.NewBadRequestError("El client_id és obligatori")
	}

	executor := ExecutorJo
	if req.Executor != nil {
		executor = *req.Executor
	}

	estat := objectiu.StatusEnCurs
	if req.Estat != nil {
		estat = *req.Estat
	}

	etiquetes := req.Etiquetes
	if etiquetes == nil {
		etiquetes = []string{}
	}

	a := &Accio{
		UserID:                userID,
		ClientID:              *req.ClientID,
		IniciativaID:          req.IniciativaID,
		EquipID:               req.EquipID,
		Executor:              executor,
		Nom:                   strings.TrimSpace(req.Nom),
		Etiquetes:             etiquetes,
		Estat:                 estat,
		DataPrevistaTancament: req.DataPrevistaTancament,
	}

	if err := s.repo.Create(ctx, a); err != nil {
		return nil, err
	}
	return a, nil
}

func (s *Service) Update(ctx context.Context, userID, id uuid.UUID, req UpdateAccioRequest) (*Accio, error) {
	aws, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}

	a := &aws.Accio

	if req.Nom != nil {
		a.Nom = strings.TrimSpace(*req.Nom)
	}
	if req.ClientID != nil {
		a.ClientID = *req.ClientID
	}
	if req.IniciativaID != nil {
		a.IniciativaID = req.IniciativaID
	}
	if req.EquipID != nil {
		a.EquipID = req.EquipID
	}
	if req.Executor != nil {
		a.Executor = *req.Executor
	}
	if req.Etiquetes != nil {
		a.Etiquetes = req.Etiquetes
	}
	if req.Estat != nil {
		a.Estat = *req.Estat
	}
	if req.DataPrevistaTancament != nil {
		a.DataPrevistaTancament = req.DataPrevistaTancament
	}

	if err := s.repo.Update(ctx, a); err != nil {
		return nil, err
	}
	return a, nil
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
