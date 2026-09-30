import type { Resena } from '../domain/resena.js';
import type { ResenaRepository } from '../domain/resena-repository.js';
import { validarNuevaResena } from './validar-nueva-resena.js';
import { validarReferenciasResena } from './validar-referencias-resena.js';

export class ErrorReglaResena extends Error {
  readonly status = 409;

  constructor(message: string) {
    super(message);
    this.name = 'ErrorReglaResena';
  }
}

export class CrearResena {
  constructor(private readonly repositorio: ResenaRepository) {}

  async ejecutar(cuerpo: unknown): Promise<Resena> {
    const entrada = validarNuevaResena(cuerpo);
    const resenaConDia = await validarReferenciasResena(entrada, this.repositorio);

    const tieneBoleta = await this.repositorio.tieneBoletaActiva(
      resenaConDia.asistente_id,
      resenaConDia.dia_id,
    );
    if (!tieneBoleta) {
      throw new ErrorReglaResena('Se requiere una boleta activa del dia del show');
    }

    const yaExiste = await this.repositorio.existeResenaActiva(
      resenaConDia.asistente_id,
      resenaConDia.show_id,
    );
    if (yaExiste) {
      throw new ErrorReglaResena('Ya existe una resena activa para este asistente y show');
    }

    return this.repositorio.crear(entrada);
  }
}
