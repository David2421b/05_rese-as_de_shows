import type { Resena } from '../domain/resena.js';
import type { ResenasRepository } from '../domain/resenas.repository.js';
import { ErrorNoEncontrado } from './errors.js';
import { validarIdPositivo } from './validar-id-positivo.js';
import { validarCambiosResena } from './validar-cambios-resena.js';

export class ActualizarResena {
  constructor(private readonly repositorio: ResenasRepository<Resena>) {}

  async ejecutar(idParametro: unknown, cuerpo: unknown): Promise<Resena> {
    const id = validarIdPositivo(idParametro, 'El id');
    const cambios = validarCambiosResena(cuerpo);
    const actualizada = await this.repositorio.actualizarActiva(id, cambios);

    if (actualizada === null) {
      throw new ErrorNoEncontrado('Reseña no encontrada');
    }

    return actualizada;
  }
}
