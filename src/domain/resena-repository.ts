import type { NuevaResena, Resena } from './resena.js';

export interface ResenaReferenciasRepository {
  existeAsistente(id: number): Promise<boolean>;
  obtenerDiaDelShow(showId: number): Promise<number | null>;
}

export interface ResenaRepository extends ResenaReferenciasRepository {
  tieneBoletaActiva(asistenteId: number, diaId: number): Promise<boolean>;
  existeResenaActiva(asistenteId: number, showId: number): Promise<boolean>;
  crear(datos: NuevaResena): Promise<Resena>;
}