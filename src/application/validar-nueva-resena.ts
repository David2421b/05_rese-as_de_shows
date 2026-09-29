import type { NuevaResena } from '../domain/resena.js';

export class ErrorValidacionResena extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ErrorValidacionResena';
  }
}

function esEnteroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

function esPuntajeValido(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= 5;
}

function esComentarioValido(valor: unknown): valor is string | null | undefined {
  return valor === undefined || valor === null || (typeof valor === 'string' && valor.length <= 500);
}

export function validarNuevaResena(cuerpo: unknown): NuevaResena {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw new ErrorValidacionResena('El cuerpo debe ser un objeto JSON');
  }

  const datos = cuerpo as Record<string, unknown>;
  const { asistente_id, show_id, puntaje, comentario } = datos;

  if (!esEnteroPositivo(asistente_id)) {
    throw new ErrorValidacionResena('asistente_id debe ser un entero positivo');
  }
  if (!esEnteroPositivo(show_id)) {
    throw new ErrorValidacionResena('show_id debe ser un entero positivo');
  }
  if (!esPuntajeValido(puntaje)) {
    throw new ErrorValidacionResena('puntaje debe ser un entero entre 1 y 5');
  }
  if (!esComentarioValido(comentario)) {
    throw new ErrorValidacionResena('comentario debe ser texto de maximo 500 caracteres');
  }

  return {
    asistente_id,
    show_id,
    puntaje,
    ...(comentario === undefined ? {} : { comentario }),
  };
}
