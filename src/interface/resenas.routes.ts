import { Router } from 'express';
import { ListarResenas } from '../application/listar-resenas.use-case.js';
import { prisma } from '../infrastructure/prisma.js';
import { PrismaResenasRepository } from '../infrastructure/prisma-resenas.repository.js';
import { ResenasController } from './resenas.controller.js';

const router = Router();
const controlador = new ResenasController(
  new ListarResenas(new PrismaResenasRepository(prisma)),
);

router.get('/', controlador.listar);

export default router;
