import { Router } from 'express';
import { ListarResenas } from '../application/listar-resenas.use-case.js';
import { ObtenerResena } from '../application/obtener-resena.use-case.js';
import { ObtenerPromedioResenas } from '../application/obtener-promedio-resenas.use-case.js';
import { prisma } from '../infrastructure/prisma.js';
import { PrismaResenasRepository } from '../infrastructure/prisma-resenas.repository.js';
import { ResenasController } from './resenas.controller.js';

const router = Router();
const repositorio = new PrismaResenasRepository(prisma);
const controlador = new ResenasController(
  new ListarResenas(repositorio),
  new ObtenerResena(repositorio),
  new ObtenerPromedioResenas(repositorio),
);

router.get('/', controlador.listar);
router.get('/show/:showId/promedio', controlador.promedio);
router.get('/:id', controlador.obtener);

export default router;
