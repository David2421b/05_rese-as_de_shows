import type { ResenasRepository } from '../domain/resenas.repository.js';
import type { Resena } from '../domain/resena.js';
import { ErrorNoEncontrado, ErrorSolicitud } from './errors.js';

function validarId(valor: unknown): number {
  if (typeof valor !== 'string' || !/^\d+$/.test(valor)) {
    throw new ErrorSolicitud('El id debe ser un entero positivo');
  }

  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ErrorSolicitud('El id debe ser un entero positivo');
  }

  return id;
}

export class ObtenerResena {
  constructor(private readonly repositorio: ResenasRepository<Resena>) {}

  async ejecutar(idParametro: unknown): Promise<Resena> {
    const id = validarId(idParametro);
    const resena = await this.repositorio.obtenerActivoPorId(id);
    if (resena === null) throw new ErrorNoEncontrado('Reseña no encontrada');
    return resena;
  }
}
