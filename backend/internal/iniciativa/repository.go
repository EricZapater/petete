package iniciativa

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"petete/backend/internal/objectiu"
	"petete/backend/internal/shared"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(ctx context.Context, userID uuid.UUID, objectiuID *uuid.UUID, estat *objectiu.ItemStatus) ([]Iniciativa, error) {
	query := `
		SELECT id, user_id, objectiu_id, nom, estat, TO_CHAR(data_prevista_tancament, 'YYYY-MM-DD'), created_at, updated_at
		FROM iniciatives
		WHERE user_id = $1
	`
	args := []interface{}{userID}
	paramIdx := 2

	if objectiuID != nil {
		query += ` AND objectiu_id = $` + string(rune('0'+paramIdx))
		args = append(args, *objectiuID)
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

	iniciatives := make([]Iniciativa, 0)
	for rows.Next() {
		var i Iniciativa
		var dt sql.NullString
		if err := rows.Scan(&i.ID, &i.UserID, &i.ObjectiuID, &i.Nom, &i.Estat, &dt, &i.CreatedAt, &i.UpdatedAt); err != nil {
			return nil, err
		}
		if dt.Valid {
			i.DataPrevistaTancament = &dt.String
		}
		iniciatives = append(iniciatives, i)
	}
	return iniciatives, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*Iniciativa, error) {
	query := `
		SELECT id, user_id, objectiu_id, nom, estat, TO_CHAR(data_prevista_tancament, 'YYYY-MM-DD'), created_at, updated_at
		FROM iniciatives
		WHERE user_id = $1 AND id = $2
	`
	i := &Iniciativa{}
	var dt sql.NullString
	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&i.ID, &i.UserID, &i.ObjectiuID, &i.Nom, &i.Estat, &dt, &i.CreatedAt, &i.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	if dt.Valid {
		i.DataPrevistaTancament = &dt.String
	}
	return i, nil
}

func (r *Repository) Create(ctx context.Context, i *Iniciativa) error {
	query := `
		INSERT INTO iniciatives (id, user_id, objectiu_id, nom, estat, data_prevista_tancament, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, $7, $8)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	i.ID = uuid.New()
	i.CreatedAt = now
	i.UpdatedAt = now

	var dtStr string
	if i.DataPrevistaTancament != nil {
		dtStr = *i.DataPrevistaTancament
	}

	return r.db.QueryRowContext(
		ctx, query, i.ID, i.UserID, i.ObjectiuID, i.Nom, i.Estat, dtStr, i.CreatedAt, i.UpdatedAt,
	).Scan(&i.ID, &i.CreatedAt, &i.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, i *Iniciativa) error {
	query := `
		UPDATE iniciatives
		SET objectiu_id = $1, nom = $2, estat = $3, data_prevista_tancament = NULLIF($4, '')::date, updated_at = $5
		WHERE user_id = $6 AND id = $7
	`
	i.UpdatedAt = time.Now().UTC()
	var dtStr string
	if i.DataPrevistaTancament != nil {
		dtStr = *i.DataPrevistaTancament
	}

	result, err := r.db.ExecContext(ctx, query, i.ObjectiuID, i.Nom, i.Estat, dtStr, i.UpdatedAt, i.UserID, i.ID)
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
	query := `DELETE FROM iniciatives WHERE user_id = $1 AND id = $2`
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
