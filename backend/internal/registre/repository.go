package registre

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

func (r *Repository) List(ctx context.Context, userID uuid.UUID, accioID *uuid.UUID, dataStr *string) ([]RegistreDiari, error) {
	query := `
		SELECT id, user_id, accio_id, TO_CHAR(data, 'YYYY-MM-DD'), hores, comentari, created_at, updated_at
		FROM registres_diaris
		WHERE user_id = $1
	`
	args := []interface{}{userID}
	paramIdx := 2

	if accioID != nil {
		query += ` AND accio_id = $` + string(rune('0'+paramIdx))
		args = append(args, *accioID)
		paramIdx++
	}
	if dataStr != nil {
		query += ` AND data = $` + string(rune('0'+paramIdx))
		args = append(args, *dataStr)
		paramIdx++
	}

	query += ` ORDER BY data DESC, created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	registres := make([]RegistreDiari, 0)
	for rows.Next() {
		var rd RegistreDiari
		if err := rows.Scan(&rd.ID, &rd.UserID, &rd.AccioID, &rd.Data, &rd.Hores, &rd.Comentari, &rd.CreatedAt, &rd.UpdatedAt); err != nil {
			return nil, err
		}
		registres = append(registres, rd)
	}
	return registres, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*RegistreDiari, error) {
	query := `
		SELECT id, user_id, accio_id, TO_CHAR(data, 'YYYY-MM-DD'), hores, comentari, created_at, updated_at
		FROM registres_diaris
		WHERE user_id = $1 AND id = $2
	`
	rd := &RegistreDiari{}
	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&rd.ID, &rd.UserID, &rd.AccioID, &rd.Data, &rd.Hores, &rd.Comentari, &rd.CreatedAt, &rd.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	return rd, nil
}

func (r *Repository) Create(ctx context.Context, rd *RegistreDiari) error {
	query := `
		INSERT INTO registres_diaris (id, user_id, accio_id, data, hores, comentari, created_at, updated_at)
		VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	rd.ID = uuid.New()
	rd.CreatedAt = now
	rd.UpdatedAt = now

	return r.db.QueryRowContext(
		ctx, query, rd.ID, rd.UserID, rd.AccioID, rd.Data, rd.Hores, rd.Comentari, rd.CreatedAt, rd.UpdatedAt,
	).Scan(&rd.ID, &rd.CreatedAt, &rd.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, rd *RegistreDiari) error {
	query := `
		UPDATE registres_diaris
		SET data = $1::date, hores = $2, comentari = $3, updated_at = $4
		WHERE user_id = $5 AND id = $6
	`
	rd.UpdatedAt = time.Now().UTC()
	result, err := r.db.ExecContext(ctx, query, rd.Data, rd.Hores, rd.Comentari, rd.UpdatedAt, rd.UserID, rd.ID)
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
	query := `DELETE FROM registres_diaris WHERE user_id = $1 AND id = $2`
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
