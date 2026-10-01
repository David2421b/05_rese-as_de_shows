import type { ActualizacionResena } from '../domain/resena.js';
import { ErrorSolicitud } from './errors.js';

const CAMPOS_EDITABLES = ['puntaje', 'comentario'];

export function validarActualizacionResena(cuerpo: unknown): ActualizacionResena {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw new ErrorSolicitud('El cuerpo debe ser un objeto JSON');
  }

  const datos = cuerpo as Record<string, unknown>;
  const campos = Object.keys(datos);

  if (campos.length === 0) {
    throw new ErrorSolicitud('Debe enviar al menos un campo editable');
  }

  const camposNoEditables = campos.filter((campo) => !CAMPOS_EDITABLES.includes(campo));
  if (camposNoEditables.length > 0) {
    throw new ErrorSolicitud(`No se pueden editar los campos: ${camposNoEditables.join(', ')}`);
  }

  const cambios: ActualizacionResena = {};

  if (Object.hasOwn(datos, 'puntaje')) {
    const puntaje = datos.puntaje;
    if (typeof puntaje !== 'number' || !Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
      throw new ErrorSolicitud('puntaje debe ser un entero entre 1 y 5');
    }
    cambios.puntaje = puntaje;
  }

  if (Object.hasOwn(datos, 'comentario')) {
    const comentario = datos.comentario;
    if (comentario !== null && (typeof comentario !== 'string' || comentario.length > 500)) {
      throw new ErrorSolicitud('comentario debe ser texto de máximo 500 caracteres o null');
    }
    cambios.comentario = comentario;
  }

  return cambios;
}
