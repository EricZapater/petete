package objectiu

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

func (r *Repository) List(ctx context.Context, userID uuid.UUID, clientID *uuid.UUID, estat *ItemStatus) ([]Objectiu, error) {
	query := `
		SELECT id, user_id, client_id, nom, descripcio, estat, TO_CHAR(data_prevista_tancament, 'YYYY-MM-DD'), created_at, updated_at
		FROM objectius
		WHERE user_id = $1
	`
	args := []interface{}{userID}
	paramIdx := 2

	if clientID != nil {
		query += ` AND client_id = $` + string(rune('0'+paramIdx))
		args = append(args, *clientID)
		paramIdx++
	}
	if estat != nil {
		query += ` AND estat = $` + string(rune('0'+paramIdx))
		args = append(args, *estat)
		paramIdx++
	}

	query += ` ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	objectius := make([]Objectiu, 0)
	for rows.Next() {
		var o Objectiu
		var desc, dt sql.NullString
		if err := rows.Scan(&o.ID, &o.UserID, &o.ClientID, &o.Nom, &desc, &o.Estat, &dt, &o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, err
		}
		if desc.Valid {
			o.Descripcio = &desc.String
		}
		if dt.Valid {
			o.DataPrevistaTancament = &dt.String
		}
		objectius = append(objectius, o)
	}
	return objectius, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*Objectiu, error) {
	query := `
		SELECT id, user_id, client_id, nom, descripcio, estat, TO_CHAR(data_prevista_tancament, 'YYYY-MM-DD'), created_at, updated_at
		FROM objectius
		WHERE user_id = $1 AND id = $2
	`
	o := &Objectiu{}
	var desc, dt sql.NullString
	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&o.ID, &o.UserID, &o.ClientID, &o.Nom, &desc, &o.Estat, &dt, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	if desc.Valid {
		o.Descripcio = &desc.String
	}
	if dt.Valid {
		o.DataPrevistaTancament = &dt.String
	}
	return o, nil
}

func (r *Repository) Create(ctx context.Context, o *Objectiu) error {
	query := `
		INSERT INTO objectius (id, user_id, client_id, nom, descripcio, estat, data_prevista_tancament, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::date, $8, $9)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	o.ID = uuid.New()
	o.CreatedAt = now
	o.UpdatedAt = now

	var dtStr string
	if o.DataPrevistaTancament != nil {
		dtStr = *o.DataPrevistaTancament
	}

	return r.db.QueryRowContext(
		ctx, query, o.ID, o.UserID, o.ClientID, o.Nom, o.Descripcio, o.Estat, dtStr, o.CreatedAt, o.UpdatedAt,
	).Scan(&o.ID, &o.CreatedAt, &o.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, o *Objectiu) error {
	query := `
		UPDATE objectius
		SET client_id = $1, nom = $2, descripcio = $3, estat = $4, data_prevista_tancament = NULLIF($5, '')::date, updated_at = $6
		WHERE user_id = $7 AND id = $8
	`
	o.UpdatedAt = time.Now().UTC()
	var dtStr string
	if o.DataPrevistaTancament != nil {
		dtStr = *o.DataPrevistaTancament
	}

	result, err := r.db.ExecContext(ctx, query, o.ClientID, o.Nom, o.Descripcio, o.Estat, dtStr, o.UpdatedAt, o.UserID, o.ID)
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
	query := `DELETE FROM objectius WHERE user_id = $1 AND id = $2`
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
