export type ExecutorType = 'jo' | 'equip';

export interface DedicacioGroup {
  id: string;
  nom: string;
  hores: number;
  percentatge: number;
}

export interface ReportSummary {
  total_hores: number;
  total_accions: number;
  accions_tancades: number;
  accions_en_curs: number;
  hores_jo: number;
  hores_equip: number;
  dedicacio_clients: DedicacioGroup[];
  dedicacio_objectius: DedicacioGroup[];
}

export interface ReportLogRow {
  registre_id: string;
  data: string;
  accio_id: string;
  accio_nom: string;
  client_nom: string;
  objectiu_nom?: string;
  iniciativa_nom?: string;
  equip_nom?: string;
  executor: ExecutorType;
  hores: number;
  comentari: string;
}

export interface ReportFilters {
  data_inici?: string;
  data_fi?: string;
  client_id?: string;
  objectiu_id?: string;
  iniciativa_id?: string;
  executor?: ExecutorType | '';
}
