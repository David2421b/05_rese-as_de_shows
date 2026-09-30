import type { ResenasRepository } from '../domain/resenas.repository.js';
import type { Resena } from '../domain/resena.js';
import { ErrorNoEncontrado } from './errors.js';
import { validarIdPositivo } from './validar-id-positivo.js';

export class ObtenerResena {
  constructor(private readonly repositorio: ResenasRepository<Resena>) {}

  async ejecutar(idParametro: unknown): Promise<Resena> {
    const id = validarIdPositivo(idParametro, 'El id');
    const resena = await this.repositorio.obtenerActivoPorId(id);
    if (resena === null) throw new ErrorNoEncontrado('Reseña no encontrada');
    return resena;
  }
}
