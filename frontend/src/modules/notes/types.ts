export interface Nota {
  id: string;
  user_id: string;
  client_id?: string;
  titol: string;
  contingut: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotaRequest {
  client_id?: string;
  titol: string;
  contingut?: string;
}

export interface UpdateNotaRequest {
  client_id?: string;
  titol?: string;
  contingut?: string;
}
