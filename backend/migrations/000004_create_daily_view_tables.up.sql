-- Accions
CREATE TABLE IF NOT EXISTS accions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    iniciativa_id UUID REFERENCES iniciatives(id) ON DELETE SET NULL,
    equip_id UUID REFERENCES equips(id) ON DELETE SET NULL,
    executor VARCHAR(20) NOT NULL DEFAULT 'jo',
    nom VARCHAR(250) NOT NULL,
    etiquetes TEXT[] NOT NULL DEFAULT '{}',
    estat VARCHAR(20) NOT NULL DEFAULT 'en_curs',
    data_prevista_tancament DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_accions_user_id ON accions(user_id);
CREATE INDEX IF NOT EXISTS idx_accions_client_id ON accions(client_id);
CREATE INDEX IF NOT EXISTS idx_accions_iniciativa_id ON accions(iniciativa_id);
CREATE INDEX IF NOT EXISTS idx_accions_estat ON accions(estat);

-- Registres Diaris (Time tracking & Comments)
CREATE TABLE IF NOT EXISTS registres_diaris (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accio_id UUID NOT NULL REFERENCES accions(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    hores NUMERIC(4,2) NOT NULL DEFAULT 0.0,
    comentari TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_registres_diaris_user_id ON registres_diaris(user_id);
CREATE INDEX IF NOT EXISTS idx_registres_diaris_accio_id ON registres_diaris(accio_id);
CREATE INDEX IF NOT EXISTS idx_registres_diaris_data ON registres_diaris(data);
