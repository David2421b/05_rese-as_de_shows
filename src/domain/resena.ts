export interface NuevaResena {
  asistente_id: number;
  show_id: number;
  puntaje: number;
  comentario?: string | null;
}

export interface Resena {
  id: number;
  asistente_id: number;
  show_id: number;
  puntaje: number;
  comentario: string | null;
  state: 'ACTIVE' | 'REMOVED';
}
