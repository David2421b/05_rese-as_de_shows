import type { ResenasRepository } from '../domain/resenas.repository.js';
import type { Resena } from '../domain/resena.js';
import { ErrorNoEncontrado } from './errors.js';
import { validarIdPositivo } from './validar-id-positivo.js';

export class EliminarResena {
  constructor(private readonly repositorio: ResenasRepository<Resena>) {}

  async ejecutar(idParametro: unknown): Promise<void> {
    const id = validarIdPositivo(idParametro, 'El id');
    const borrada = await this.repositorio.borrarLogicamente(id);

    if (!borrada) {
      throw new ErrorNoEncontrado('Reseña no encontrada');
    }
  }
}