export interface FiltrosResenas {
  page: number;
  limit: number;
  show_id?: number;
  asistente_id?: number;
}

export interface ResultadoListado<T> {
  data: T[];
  total: number;
}

export interface PromedioResenas {
  show_id: number;
  total: number;
  promedio: number;
}

export interface ResenasRepository<T> {
  listar(filtros: FiltrosResenas): Promise<ResultadoListado<T>>;
  obtenerActivoPorId(id: number): Promise<T | null>;
  obtenerPromedioActivoPorShow(showId: number): Promise<PromedioResenas | null>;
}
