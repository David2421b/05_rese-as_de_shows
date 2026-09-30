import type { PromedioResenas, ResenasRepository } from '../domain/resenas.repository.js';
import type { Resena } from '../domain/resena.js';
import { ErrorNoEncontrado } from './errors.js';
import { validarIdPositivo } from './validar-id-positivo.js';

export class ObtenerPromedioResenas {
  constructor(private readonly repositorio: ResenasRepository<Resena>) {}

  async ejecutar(showIdParametro: unknown): Promise<PromedioResenas> {
    const showId = validarIdPositivo(showIdParametro, 'El showId');
    const promedio = await this.repositorio.obtenerPromedioActivoPorShow(showId);
    if (promedio === null) throw new ErrorNoEncontrado('Show no encontrado');
    return promedio;
  }
}
