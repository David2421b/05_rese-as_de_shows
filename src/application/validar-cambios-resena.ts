import type { CambiosResena } from '../domain/resenas.repository.js';
import { ErrorValidacionResena } from './validar-nueva-resena.js';

const CAMPOS_EDITABLES = new Set(['puntaje', 'comentario']);

export function validarCambiosResena(cuerpo: unknown): CambiosResena {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw new ErrorValidacionResena('El cuerpo debe ser un objeto JSON');
  }

  const datos = cuerpo as Record<string, unknown>;
  const campos = Object.keys(datos);

  for (const campo of campos) {
    if (!CAMPOS_EDITABLES.has(campo)) {
      throw new ErrorValidacionResena(`El campo ${campo} no se puede editar`);
    }
  }

  if (campos.length === 0) {
    throw new ErrorValidacionResena('Debe enviar al menos un campo editable');
  }
  if (
    'puntaje' in datos &&
    (typeof datos.puntaje !== 'number' || !Number.isInteger(datos.puntaje) || datos.puntaje < 1 || datos.puntaje > 5)
  ) {
    throw new ErrorValidacionResena('puntaje debe ser un entero entre 1 y 5');
  }
  if (
    'comentario' in datos &&
    datos.comentario !== null &&
    (typeof datos.comentario !== 'string' || datos.comentario.length > 500)
  ) {
    throw new ErrorValidacionResena('comentario debe ser texto de maximo 500 caracteres');
  }

  return {
    ...('puntaje' in datos ? { puntaje: datos.puntaje as number } : {}),
    ...('comentario' in datos ? { comentario: datos.comentario as string | null } : {}),
  };
}
