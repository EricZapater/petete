package client

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

func (r *Repository) List(ctx context.Context, userID uuid.UUID, actiu *bool) ([]Client, error) {
	var query string
	var rows *sql.Rows
	var err error

	if actiu != nil {
		query = `
			SELECT id, user_id, nom, actiu, created_at, updated_at
			FROM clients
			WHERE user_id = $1 AND actiu = $2
			ORDER BY nom ASC
		`
		rows, err = r.db.QueryContext(ctx, query, userID, *actiu)
	} else {
		query = `
			SELECT id, user_id, nom, actiu, created_at, updated_at
			FROM clients
			WHERE user_id = $1
			ORDER BY nom ASC
		`
		rows, err = r.db.QueryContext(ctx, query, userID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	clients := make([]Client, 0)
	for rows.Next() {
		var c Client
		if err := rows.Scan(&c.ID, &c.UserID, &c.Nom, &c.Actiu, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		clients = append(clients, c)
	}
	return clients, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*Client, error) {
	query := `
		SELECT id, user_id, nom, actiu, created_at, updated_at
		FROM clients
		WHERE user_id = $1 AND id = $2
	`
	c := &Client{}
	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&c.ID, &c.UserID, &c.Nom, &c.Actiu, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	return c, nil
}

func (r *Repository) Create(ctx context.Context, c *Client) error {
	query := `
		INSERT INTO clients (id, user_id, nom, actiu, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	c.ID = uuid.New()
	c.CreatedAt = now
	c.UpdatedAt = now

	return r.db.QueryRowContext(
		ctx, query, c.ID, c.UserID, c.Nom, c.Actiu, c.CreatedAt, c.UpdatedAt,
	).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, c *Client) error {
	query := `
		UPDATE clients
		SET nom = $1, actiu = $2, updated_at = $3
		WHERE user_id = $4 AND id = $5
	`
	c.UpdatedAt = time.Now().UTC()
	result, err := r.db.ExecContext(ctx, query, c.Nom, c.Actiu, c.UpdatedAt, c.UserID, c.ID)
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
	query := `DELETE FROM clients WHERE user_id = $1 AND id = $2`
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
