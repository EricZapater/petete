package metrica

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"petete/backend/internal/shared"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(ctx context.Context, userID uuid.UUID, iniciativaID *uuid.UUID) ([]Metrica, error) {
	var query string
	var rows *sql.Rows
	var err error

	if iniciativaID != nil {
		query = `
			SELECT id, user_id, iniciativa_id, nom, unitat, valor_objectiu, valor_actual, created_at, updated_at
			FROM metriques
			WHERE user_id = $1 AND iniciativa_id = $2
			ORDER BY created_at DESC
		`
		rows, err = r.db.QueryContext(ctx, query, userID, *iniciativaID)
	} else {
		query = `
			SELECT id, user_id, iniciativa_id, nom, unitat, valor_objectiu, valor_actual, created_at, updated_at
			FROM metriques
			WHERE user_id = $1
			ORDER BY created_at DESC
		`
		rows, err = r.db.QueryContext(ctx, query, userID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	metriques := make([]Metrica, 0)
	for rows.Next() {
		var m Metrica
		if err := rows.Scan(&m.ID, &m.UserID, &m.IniciativaID, &m.Nom, &m.Unitat, &m.ValorObjectiu, &m.ValorActual, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		metriques = append(metriques, m)
	}
	return metriques, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*Metrica, error) {
	query := `
		SELECT id, user_id, iniciativa_id, nom, unitat, valor_objectiu, valor_actual, created_at, updated_at
		FROM metriques
		WHERE user_id = $1 AND id = $2
	`
	m := &Metrica{}
	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&m.ID, &m.UserID, &m.IniciativaID, &m.Nom, &m.Unitat, &m.ValorObjectiu, &m.ValorActual, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	return m, nil
}

func (r *Repository) Create(ctx context.Context, m *Metrica) error {
	query := `
		INSERT INTO metriques (id, user_id, iniciativa_id, nom, unitat, valor_objectiu, valor_actual, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	m.ID = uuid.New()
	m.CreatedAt = now
	m.UpdatedAt = now

	return r.db.QueryRowContext(
		ctx, query, m.ID, m.UserID, m.IniciativaID, m.Nom, m.Unitat, m.ValorObjectiu, m.ValorActual, m.CreatedAt, m.UpdatedAt,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, m *Metrica) error {
	query := `
		UPDATE metriques
		SET nom = $1, unitat = $2, valor_objectiu = $3, valor_actual = $4, updated_at = $5
		WHERE user_id = $6 AND id = $7
	`
	m.UpdatedAt = time.Now().UTC()
	result, err := r.db.ExecContext(ctx, query, m.Nom, m.Unitat, m.ValorObjectiu, m.ValorActual, m.UpdatedAt, m.UserID, m.ID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return shared.ErrUserNotFound
	}
	return nil
}

func (r *Repository) Delete(ctx context.Context, userID, id uuid.UUID) error {
	query := `DELETE FROM metriques WHERE user_id = $1 AND id = $2`
	result, err := r.db.ExecContext(ctx, query, userID, id)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return shared.ErrUserNotFound
	}
	return nil
}
