import type { NextFunction, Request, Response } from 'express';
import { ErrorSolicitud, ListarResenas } from '../application/listar-resenas.use-case.js';

export class ResenasController {
  constructor(private readonly listarResenas: ListarResenas) {}

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = await this.listarResenas.ejecutar(req.query as Record<string, unknown>);
      res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof ErrorSolicitud) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  };
}
