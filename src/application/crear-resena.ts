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

export async function crearResena(cuerpo: unknown, repositorio: ResenaRepository): Promise<Resena> {
  const entrada = validarNuevaResena(cuerpo);
  const resenaConDia = await validarReferenciasResena(entrada, repositorio);

  const tieneBoleta = await repositorio.tieneBoletaActiva(
    resenaConDia.asistente_id,
    resenaConDia.dia_id,
  );
  if (!tieneBoleta) {
    throw new ErrorReglaResena('Se requiere una boleta activa del dia del show');
  }

  const yaExiste = await repositorio.existeResenaActiva(
    resenaConDia.asistente_id,
    resenaConDia.show_id,
  );
  if (yaExiste) {
    throw new ErrorReglaResena('Ya existe una resena activa para este asistente y show');
  }

  return repositorio.crear(entrada);
}
