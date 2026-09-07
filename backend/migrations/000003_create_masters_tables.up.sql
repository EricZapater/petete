-- Clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nom VARCHAR(150) NOT NULL,
    actiu BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Equips
CREATE TABLE IF NOT EXISTS equips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    nom VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_equips_user_id ON equips(user_id);
CREATE INDEX IF NOT EXISTS idx_equips_client_id ON equips(client_id);

-- Objectius
CREATE TABLE IF NOT EXISTS objectius (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    descripcio TEXT,
    estat VARCHAR(20) NOT NULL DEFAULT 'pendent',
    data_prevista_tancament DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_objectius_user_id ON objectius(user_id);
CREATE INDEX IF NOT EXISTS idx_objectius_client_id ON objectius(client_id);
CREATE INDEX IF NOT EXISTS idx_objectius_estat ON objectius(estat);

-- Iniciatives
CREATE TABLE IF NOT EXISTS iniciatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    objectiu_id UUID NOT NULL REFERENCES objectius(id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    estat VARCHAR(20) NOT NULL DEFAULT 'pendent',
    data_prevista_tancament DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_iniciatives_user_id ON iniciatives(user_id);
CREATE INDEX IF NOT EXISTS idx_iniciatives_objectiu_id ON iniciatives(objectiu_id);

-- Mètriques
CREATE TABLE IF NOT EXISTS metriques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    iniciativa_id UUID NOT NULL REFERENCES iniciatives(id) ON DELETE CASCADE,
    nom VARCHAR(150) NOT NULL,
    unitat VARCHAR(50) NOT NULL,
    valor_objectiu NUMERIC(12,2) NOT NULL DEFAULT 0,
    valor_actual NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_metriques_user_id ON metriques(user_id);
CREATE INDEX IF NOT EXISTS idx_metriques_iniciativa_id ON metriques(iniciativa_id);
