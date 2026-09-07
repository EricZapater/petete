package accio

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"petete/backend/internal/shared"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(ctx context.Context, userID uuid.UUID, openOnly bool, clientID, iniciativaID *uuid.UUID, executor *ExecutorType) ([]AccioWithStats, error) {
	query := `
		SELECT 
			a.id, a.user_id, a.client_id, a.iniciativa_id, a.equip_id, 
			a.executor, a.nom, a.etiquetes, a.estat, 
			TO_CHAR(a.data_prevista_tancament, 'YYYY-MM-DD'), a.created_at, a.updated_at,
			c.nom as client_nom,
			i.nom as iniciativa_nom,
			e.nom as equip_nom,
			COALESCE(SUM(rd.hores), 0.0) as total_hores
		FROM accions a
		JOIN clients c ON a.client_id = c.id
		LEFT JOIN iniciatives i ON a.iniciativa_id = i.id
		LEFT JOIN equips e ON a.equip_id = e.id
		LEFT JOIN registres_diaris rd ON a.id = rd.accio_id
		WHERE a.user_id = $1
	`
	args := []interface{}{userID}
	paramIdx := 2

	if openOnly {
		query += ` AND a.estat != 'tancat'`
	}
	if clientID != nil {
		query += ` AND a.client_id = $` + string(rune('0'+paramIdx))
		args = append(args, *clientID)
		paramIdx++
	}
	if iniciativaID != nil {
		query += ` AND a.iniciativa_id = $` + string(rune('0'+paramIdx))
		args = append(args, *iniciativaID)
		paramIdx++
	}
	if executor != nil {
		query += ` AND a.executor = $` + string(rune('0'+paramIdx))
		args = append(args, *executor)
		paramIdx++
	}

	query += ` GROUP BY a.id, c.nom, i.nom, e.nom ORDER BY a.created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	accions := make([]AccioWithStats, 0)
	for rows.Next() {
		var aws AccioWithStats
		var initID, eqID uuid.NullUUID
		var dt, initNom, eqNom sql.NullString

		err := rows.Scan(
			&aws.ID, &aws.UserID, &aws.ClientID, &initID, &eqID,
			&aws.Executor, &aws.Nom, pq.Array(&aws.Etiquetes), &aws.Estat,
			&dt, &aws.CreatedAt, &aws.UpdatedAt,
			&aws.ClientNom, &initNom, &eqNom, &aws.TotalHores,
		)
		if err != nil {
			return nil, err
		}

		if initID.Valid {
			aws.IniciativaID = &initID.UUID
		}
		if eqID.Valid {
			aws.EquipID = &eqID.UUID
		}
		if dt.Valid {
			aws.DataPrevistaTancament = &dt.String
		}
		if initNom.Valid {
			aws.IniciativaNom = &initNom.String
		}
		if eqNom.Valid {
			aws.EquipNom = &eqNom.String
		}

		accions = append(accions, aws)
	}
	return accions, nil
}

func (r *Repository) GetByID(ctx context.Context, userID, id uuid.UUID) (*AccioWithStats, error) {
	query := `
		SELECT 
			a.id, a.user_id, a.client_id, a.iniciativa_id, a.equip_id, 
			a.executor, a.nom, a.etiquetes, a.estat, 
			TO_CHAR(a.data_prevista_tancament, 'YYYY-MM-DD'), a.created_at, a.updated_at,
			c.nom as client_nom,
			i.nom as iniciativa_nom,
			e.nom as equip_nom,
			COALESCE(SUM(rd.hores), 0.0) as total_hores
		FROM accions a
		JOIN clients c ON a.client_id = c.id
		LEFT JOIN iniciatives i ON a.iniciativa_id = i.id
		LEFT JOIN equips e ON a.equip_id = e.id
		LEFT JOIN registres_diaris rd ON a.id = rd.accio_id
		WHERE a.user_id = $1 AND a.id = $2
		GROUP BY a.id, c.nom, i.nom, e.nom
	`
	aws := &AccioWithStats{}
	var initID, eqID uuid.NullUUID
	var dt, initNom, eqNom sql.NullString

	err := r.db.QueryRowContext(ctx, query, userID, id).Scan(
		&aws.ID, &aws.UserID, &aws.ClientID, &initID, &eqID,
		&aws.Executor, &aws.Nom, pq.Array(&aws.Etiquetes), &aws.Estat,
		&dt, &aws.CreatedAt, &aws.UpdatedAt,
		&aws.ClientNom, &initNom, &eqNom, &aws.TotalHores,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}

	if initID.Valid {
		aws.IniciativaID = &initID.UUID
	}
	if eqID.Valid {
		aws.EquipID = &eqID.UUID
	}
	if dt.Valid {
		aws.DataPrevistaTancament = &dt.String
	}
	if initNom.Valid {
		aws.IniciativaNom = &initNom.String
	}
	if eqNom.Valid {
		aws.EquipNom = &eqNom.String
	}

	return aws, nil
}

func (r *Repository) Create(ctx context.Context, a *Accio) error {
	query := `
		INSERT INTO accions (
			id, user_id, client_id, iniciativa_id, equip_id, 
			executor, nom, etiquetes, estat, data_prevista_tancament, 
			created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULLIF($10, '')::date, $11, $12)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	a.ID = uuid.New()
	a.CreatedAt = now
	a.UpdatedAt = now

	var dtStr string
	if a.DataPrevistaTancament != nil {
		dtStr = *a.DataPrevistaTancament
	}
	if a.Etiquetes == nil {
		a.Etiquetes = []string{}
	}

	return r.db.QueryRowContext(
		ctx, query,
		a.ID, a.UserID, a.ClientID, a.IniciativaID, a.EquipID,
		a.Executor, a.Nom, pq.Array(a.Etiquetes), a.Estat, dtStr,
		a.CreatedAt, a.UpdatedAt,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, a *Accio) error {
	query := `
		UPDATE accions
		SET client_id = $1, iniciativa_id = $2, equip_id = $3, 
		    executor = $4, nom = $5, etiquetes = $6, estat = $7, 
		    data_prevista_tancament = NULLIF($8, '')::date, updated_at = $9
		WHERE user_id = $10 AND id = $11
	`
	a.UpdatedAt = time.Now().UTC()
	var dtStr string
	if a.DataPrevistaTancament != nil {
		dtStr = *a.DataPrevistaTancament
	}
	if a.Etiquetes == nil {
		a.Etiquetes = []string{}
	}

	result, err := r.db.ExecContext(
		ctx, query,
		a.ClientID, a.IniciativaID, a.EquipID,
		a.Executor, a.Nom, pq.Array(a.Etiquetes), a.Estat,
		dtStr, a.UpdatedAt, a.UserID, a.ID,
	)
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
	query := `DELETE FROM accions WHERE user_id = $1 AND id = $2`
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
