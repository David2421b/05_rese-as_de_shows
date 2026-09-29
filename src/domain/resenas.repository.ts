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

export interface ResenasRepository<T> {
  listar(filtros: FiltrosResenas): Promise<ResultadoListado<T>>;
}
