import { ErrorSolicitud } from './errors.js';

export function validarIdPositivo(valor: unknown, nombre: string): number {
  if (typeof valor !== 'string' || !/^\d+$/.test(valor)) {
    throw new ErrorSolicitud(`${nombre} debe ser un entero positivo`);
  }

  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ErrorSolicitud(`${nombre} debe ser un entero positivo`);
  }

  return id;
}
