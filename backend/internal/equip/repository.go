package equip

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

func (r *Repository) List(ctx context.Context, userID uuid.UUID, clientID *uuid.UUID) ([]Equip, error) {
	var query string
	var rows *sql.Rows
	var err error

	if clientID != nil {
		query = `
			SELECT id, user_id, client_id, nom, created_at, updated_at
			FROM equips
			WHERE user_id = $1 AND client_id = $2
			ORDER BY nom ASC
		`
		rows, err = r.db.QueryContext(ctx, query, userID, *clientID)
	} else {
		query = `
			SELECT id, user_id, client_id, nom, created_at, updated_at
			FROM equips
			WHERE user_id = $1
			ORDER BY nom ASC
		`
		rows, err = r.db.QueryContext(ctx, query, userID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	equips := make([]Equip, 0)
	for rows.Next() {
		var e Equip
		if err := rows.Scan(&e.ID, &e.UserID, &e.ClientID, &e.Nom, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		equips = append(equips, e)
	}
	return equips, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*Equip, error) {
	query := `
		SELECT id, user_id, client_id, nom, created_at, updated_at
		FROM equips
		WHERE user_id = $1 AND id = $2
	`
	e := &Equip{}
	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&e.ID, &e.UserID, &e.ClientID, &e.Nom, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	return e, nil
}

func (r *Repository) Create(ctx context.Context, e *Equip) error {
	query := `
		INSERT INTO equips (id, user_id, client_id, nom, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	e.ID = uuid.New()
	e.CreatedAt = now
	e.UpdatedAt = now

	return r.db.QueryRowContext(
		ctx, query, e.ID, e.UserID, e.ClientID, e.Nom, e.CreatedAt, e.UpdatedAt,
	).Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, e *Equip) error {
	query := `
		UPDATE equips
		SET client_id = $1, nom = $2, updated_at = $3
		WHERE user_id = $4 AND id = $5
	`
	e.UpdatedAt = time.Now().UTC()
	result, err := r.db.ExecContext(ctx, query, e.ClientID, e.Nom, e.UpdatedAt, e.UserID, e.ID)
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
	query := `DELETE FROM equips WHERE user_id = $1 AND id = $2`
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
