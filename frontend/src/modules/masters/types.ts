export type ItemStatus = 'pendent' | 'en_curs' | 'bloquejat' | 'tancat';

export interface Client {
  id: string;
  user_id: string;
  nom: string;
  actiu: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  nom: string;
  actiu?: boolean;
}

export interface UpdateClientRequest {
  nom?: string;
  actiu?: boolean;
}

export interface Equip {
  id: string;
  user_id: string;
  client_id: string;
  nom: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEquipRequest {
  client_id: string;
  nom: string;
}

export interface UpdateEquipRequest {
  client_id?: string;
  nom?: string;
}

export interface Objectiu {
  id: string;
  user_id: string;
  client_id: string;
  nom: string;
  descripcio?: string;
  estat: ItemStatus;
  data_prevista_tancament?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectiuRequest {
  client_id: string;
  nom: string;
  descripcio?: string;
  estat?: ItemStatus;
  data_prevista_tancament?: string;
}

export interface UpdateObjectiuRequest {
  client_id?: string;
  nom?: string;
  descripcio?: string;
  estat?: ItemStatus;
  data_prevista_tancament?: string;
}

export interface Iniciativa {
  id: string;
  user_id: string;
  objectiu_id: string;
  nom: string;
  estat: ItemStatus;
  data_prevista_tancament?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIniciativaRequest {
  objectiu_id: string;
  nom: string;
  estat?: ItemStatus;
  data_prevista_tancament?: string;
}

export interface UpdateIniciativaRequest {
  objectiu_id?: string;
  nom?: string;
  estat?: ItemStatus;
  data_prevista_tancament?: string;
}

export interface Metrica {
  id: string;
  user_id: string;
  iniciativa_id: string;
  nom: string;
  unitat: string;
  valor_objectiu: number;
  valor_actual: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMetricaRequest {
  iniciativa_id: string;
  nom: string;
  unitat: string;
  valor_objectiu: number;
  valor_actual: number;
}

export interface UpdateMetricaRequest {
  nom?: string;
  unitat?: string;
  valor_objectiu?: number;
  valor_actual?: number;
}
