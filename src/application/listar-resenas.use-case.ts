import type { FiltrosResenas, ResenasRepository } from '../domain/resenas.repository.js';

export class ErrorSolicitud extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorSolicitud';
  }
}

export interface Resena {
  id: number;
  asistente_id: number;
  show_id: number;
  puntaje: number;
  comentario: string | null;
  state: string;
}

function enteroPositivo(valor: unknown, nombre: string, predeterminado?: number): number | undefined {
  if (valor === undefined && predeterminado !== undefined) return predeterminado;
  if (typeof valor !== 'string' || !/^\d+$/.test(valor)) {
    throw new ErrorSolicitud(`${nombre} debe ser un entero positivo`);
  }

  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new ErrorSolicitud(`${nombre} debe ser un entero positivo`);
  }
  return numero;
}

export function leerFiltrosResenas(query: Record<string, unknown>): FiltrosResenas {
  const page = enteroPositivo(query.page, 'page', 1)!;
  const limit = enteroPositivo(query.limit, 'limit', 10)!;
  if (limit > 50) throw new ErrorSolicitud('limit no puede ser mayor que 50');

  const show_id = enteroPositivo(query.show_id, 'show_id');
  const asistente_id = enteroPositivo(query.asistente_id, 'asistente_id');
  return { page, limit, show_id, asistente_id };
}

export class ListarResenas {
  constructor(private readonly repositorio: ResenasRepository<Resena>) {}

  async ejecutar(query: Record<string, unknown>) {
    const filtros = leerFiltrosResenas(query);
    const { data, total } = await this.repositorio.listar(filtros);
    return {
      pagination: {
        total,
        currentPage: filtros.page,
        limit: filtros.limit,
        totalPages: Math.ceil(total / filtros.limit),
      },
      data,
    };
  }
}
