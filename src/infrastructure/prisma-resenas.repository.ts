import type { PrismaClient } from '@prisma/client';
import type { FiltrosResenas, ResenasRepository, ResultadoListado } from '../domain/resenas.repository.js';
import type { Resena } from '../application/listar-resenas.use-case.js';

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
}
