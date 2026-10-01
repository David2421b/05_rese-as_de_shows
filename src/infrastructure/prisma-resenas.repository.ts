import type { PrismaClient } from '@prisma/client';
import type { FiltrosResenas, PromedioResenas, ResenasRepository, ResultadoListado } from '../domain/resenas.repository.js';
import type { ResenaRepository } from '../domain/resena-repository.js';
import type { NuevaResena, Resena } from '../domain/resena.js';

export class PrismaResenasRepository implements ResenasRepository<Resena>, ResenaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async existeAsistente(id: number): Promise<boolean> {
    const resultado = await this.prisma.$queryRawUnsafe<Array<{ existe: boolean }>>(
      'SELECT EXISTS (SELECT 1 FROM asistentes WHERE id = $1) AS existe',
      id,
    );
    return resultado[0]?.existe ?? false;
  }

  async obtenerDiaDelShow(showId: number): Promise<number | null> {
    const resultado = await this.prisma.$queryRawUnsafe<Array<{ dia_id: number }>>(
      'SELECT dia_id FROM shows WHERE id = $1 LIMIT 1',
      showId,
    );
    return resultado[0]?.dia_id ?? null;
  }

  async tieneBoletaActiva(asistenteId: number, diaId: number): Promise<boolean> {
    const resultado = await this.prisma.$queryRawUnsafe<Array<{ existe: boolean }>>(
      "SELECT EXISTS (SELECT 1 FROM boletas WHERE asistente_id = $1 AND dia_id = $2 AND state = 'ACTIVE') AS existe",
      asistenteId,
      diaId,
    );
    return resultado[0]?.existe ?? false;
  }

  async existeResenaActiva(asistenteId: number, showId: number): Promise<boolean> {
    const resultado = await this.prisma.$queryRawUnsafe<Array<{ existe: boolean }>>(
      "SELECT EXISTS (SELECT 1 FROM resenas WHERE asistente_id = $1 AND show_id = $2 AND state = 'ACTIVE') AS existe",
      asistenteId,
      showId,
    );
    return resultado[0]?.existe ?? false;
  }

  async crear(datos: NuevaResena): Promise<Resena> {
    const resultado = await this.prisma.$queryRawUnsafe<Resena[]>(
      "INSERT INTO resenas (asistente_id, show_id, puntaje, comentario, state) VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING id, asistente_id, show_id, puntaje, comentario, state",
      datos.asistente_id,
      datos.show_id,
      datos.puntaje,
      datos.comentario ?? null,
    );
    const resena = resultado[0];
    if (!resena) throw new Error('No fue posible crear la resena');
    return resena;
  }

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
