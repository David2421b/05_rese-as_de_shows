import type { NuevaResena } from '../domain/resena.js';
import type { ResenaReferenciasRepository } from '../domain/resena-repository.js';

export interface ResenaConDia extends NuevaResena {
  dia_id: number;
}

export class ErrorReferenciaResena extends Error {
  readonly status = 404;

  constructor(message: string) {
    super(message);
    this.name = 'ErrorReferenciaResena';
  }
}

export async function validarReferenciasResena(
  resena: NuevaResena,
  repositorio: ResenaReferenciasRepository,
): Promise<ResenaConDia> {
  const [asistenteExiste, diaId] = await Promise.all([
    repositorio.existeAsistente(resena.asistente_id),
    repositorio.obtenerDiaDelShow(resena.show_id),
  ]);

  if (!asistenteExiste) {
    throw new ErrorReferenciaResena('El asistente no existe');
  }
  if (diaId === null) {
    throw new ErrorReferenciaResena('El show no existe');
  }

  return { ...resena, dia_id: diaId };
}
