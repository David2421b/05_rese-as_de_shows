import type { PrismaClient } from '@prisma/client';
import type { FiltrosResenas, PromedioResenas, ResenasRepository, ResultadoListado } from '../domain/resenas.repository.js';
import type { Resena } from '../domain/resena.js';

export class PrismaResenasRepository implements ResenasRepository<Resena> {
  constructor(private readonly prisma: PrismaClient) {}

  async listar(filtros: FiltrosResenas): Promise<ResultadoListado<Resena>> {
    const condiciones = ["state <> 'REMOVED'"];
    const parametros: number[] = [];

    if (filtros.show_id !== undefined) {
      parametros.push(filtros.show_id);
      condiciones.push(`show_id = $${parametros.length}`);
    }
    if (filtros.asistente_id !== undefined) {
      parametros.push(filtros.asistente_id);
      condiciones.push(`asistente_id = $${parametros.length}`);
    }

    const where = condiciones.join(' AND ');
    const conteo = await this.prisma.$queryRawUnsafe<Array<{ total: number }>>(
      `SELECT COUNT(*)::int AS total FROM resenas WHERE ${where}`,
      ...parametros,
    );

    const offset = (filtros.page - 1) * filtros.limit;
    const paginacionParametros = [...parametros, filtros.limit, offset];
    const data = await this.prisma.$queryRawUnsafe<Resena[]>(
      `SELECT * FROM resenas WHERE ${where} ORDER BY id ASC LIMIT $${parametros.length + 1} OFFSET $${parametros.length + 2}`,
      ...paginacionParametros,
    );

    return { data, total: Number(conteo[0]?.total ?? 0) };
  }

  async obtenerActivoPorId(id: number): Promise<Resena | null> {
    const filas = await this.prisma.$queryRawUnsafe<Resena[]>(
      "SELECT * FROM resenas WHERE id = $1 AND state <> 'REMOVED'",
      id,
    );
    return filas[0] ?? null;
  }

  async obtenerPromedioActivoPorShow(showId: number): Promise<PromedioResenas | null> {
    const shows = await this.prisma.$queryRawUnsafe<Array<{ id: number }>>(
      'SELECT id FROM shows WHERE id = $1',
      showId,
    );
    if (shows.length === 0) return null;

    const resultados = await this.prisma.$queryRawUnsafe<Array<{ total: number; promedio: number }>>(
      "SELECT COUNT(*)::int AS total, COALESCE(ROUND(AVG(puntaje)::numeric, 2), 0)::float8 AS promedio FROM resenas WHERE show_id = $1 AND state = 'ACTIVE'",
      showId,
    );

    return {
      show_id: showId,
      total: Number(resultados[0]?.total ?? 0),
      promedio: Number(resultados[0]?.promedio ?? 0),
    };
  }
}
