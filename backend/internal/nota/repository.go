package nota

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
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

func (r *Repository) List(ctx context.Context, userID uuid.UUID, clientID *uuid.UUID, search string) ([]Nota, error) {
	query := `
		SELECT id, user_id, client_id, titol, contingut, created_at, updated_at
		FROM notes
		WHERE user_id = $1
	`
	args := []interface{}{userID}
	paramIdx := 2

	if clientID != nil {
		query += fmt.Sprintf(" AND client_id = $%d", paramIdx)
		args = append(args, *clientID)
		paramIdx++
	}

	if search != "" {
		query += fmt.Sprintf(" AND (titol ILIKE $%d OR contingut ILIKE $%d)", paramIdx, paramIdx)
		args = append(args, "%"+search+"%")
		paramIdx++
	}

	query += " ORDER BY updated_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	notes := make([]Nota, 0)
	for rows.Next() {
		var n Nota
		var cid sql.NullString
		if err := rows.Scan(&n.ID, &n.UserID, &cid, &n.Titol, &n.Contingut, &n.CreatedAt, &n.UpdatedAt); err != nil {
			return nil, err
		}
		if cid.Valid {
			if parsed, err := uuid.Parse(cid.String); err == nil {
				n.ClientID = &parsed
			}
		}
		notes = append(notes, n)
	}

	return notes, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*Nota, error) {
	query := `
		SELECT id, user_id, client_id, titol, contingut, created_at, updated_at
		FROM notes
		WHERE user_id = $1 AND id = $2
	`
	var n Nota
	var cid sql.NullString
	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&n.ID, &n.UserID, &cid, &n.Titol, &n.Contingut, &n.CreatedAt, &n.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	if cid.Valid {
		if parsed, err := uuid.Parse(cid.String); err == nil {
			n.ClientID = &parsed
		}
	}
	return &n, nil
}

func (r *Repository) Create(ctx context.Context, n *Nota) error {
	query := `
		INSERT INTO notes (id, user_id, client_id, titol, contingut, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	n.ID = uuid.New()
	n.CreatedAt = now
	n.UpdatedAt = now

	return r.db.QueryRowContext(
		ctx, query, n.ID, n.UserID, n.ClientID, n.Titol, n.Contingut, n.CreatedAt, n.UpdatedAt,
	).Scan(&n.ID, &n.CreatedAt, &n.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, n *Nota) error {
	query := `
		UPDATE notes
		SET client_id = $1, titol = $2, contingut = $3, updated_at = $4
		WHERE user_id = $5 AND id = $6
	`
	n.UpdatedAt = time.Now().UTC()

	result, err := r.db.ExecContext(ctx, query, n.ClientID, n.Titol, n.Contingut, n.UpdatedAt, n.UserID, n.ID)
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
	query := `DELETE FROM notes WHERE user_id = $1 AND id = $2`
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
