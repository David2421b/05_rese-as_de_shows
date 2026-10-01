import type { ResenasRepository } from '../domain/resenas.repository.js';
import type { Resena } from '../domain/resena.js';
import { ErrorNoEncontrado } from './errors.js';
import { validarActualizacionResena } from './validar-actualizacion-resena.js';
import { validarIdPositivo } from './validar-id-positivo.js';

export class ActualizarResena {
  constructor(private readonly repositorio: ResenasRepository<Resena>) {}

  async ejecutar(idParametro: unknown, cuerpo: unknown): Promise<Resena> {
    const id = validarIdPositivo(idParametro, 'El id');
    const cambios = validarActualizacionResena(cuerpo);
    const resena = await this.repositorio.actualizarActivoPorId(id, cambios);

    if (resena === null) throw new ErrorNoEncontrado('Reseña no encontrada');
    return resena;
  }
}
