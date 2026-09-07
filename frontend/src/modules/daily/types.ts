import { ItemStatus } from '../masters/types';

export type ExecutorType = 'jo' | 'equip';

export interface RegistreDiari {
  id: string;
  user_id: string;
  accio_id: string;
  data: string; // YYYY-MM-DD
  hores: number;
  comentari: string;
  created_at: string;
  updated_at: string;
}

export interface Accio {
  id: string;
  user_id: string;
  client_id: string;
  iniciativa_id?: string;
  equip_id?: string;
  executor: ExecutorType;
  nom: string;
  etiquetes: string[];
  estat: ItemStatus;
  data_prevista_tancament?: string;
  created_at: string;
  updated_at: string;
}

export interface AccioWithStats extends Accio {
  total_hores: number;
  client_nom: string;
  iniciativa_nom?: string;
  equip_nom?: string;
  recent_registres: RegistreDiari[];
}

export interface CreateAccioRequest {
  nom: string;
  client_id?: string;
  iniciativa_id?: string;
  equip_id?: string;
  executor?: ExecutorType;
  etiquetes?: string[];
  estat?: ItemStatus;
  data_prevista_tancament?: string;
}

export interface UpdateAccioRequest {
  nom?: string;
  client_id?: string;
  iniciativa_id?: string;
  equip_id?: string;
  executor?: ExecutorType;
  etiquetes?: string[];
  estat?: ItemStatus;
  data_prevista_tancament?: string;
}

export interface CreateRegistreDiariRequest {
  accio_id: string;
  data: string;
  hores: number;
  comentari?: string;
}

export interface UpdateRegistreDiariRequest {
  data?: string;
  hores?: number;
  comentari?: string;
}
