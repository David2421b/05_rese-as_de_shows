import type { NextFunction, Request, Response } from 'express';
import { ListarResenas } from '../application/listar-resenas.use-case.js';
import { ObtenerResena } from '../application/obtener-resena.use-case.js';
import { CrearResena, ErrorReglaResena } from '../application/crear-resena.js';
import { ObtenerPromedioResenas } from '../application/obtener-promedio-resenas.use-case.js';
import { ErrorNoEncontrado, ErrorSolicitud } from '../application/errors.js';
import { ErrorReferenciaResena } from '../application/validar-referencias-resena.js';
import { ErrorValidacionResena } from '../application/validar-nueva-resena.js';
import { EliminarResena } from '../application/eliminar-resenas.use-case.js';
import { ActualizarResena } from '../application/actualizar-resena.use-case.js';

export class ResenasController {
  constructor(
    private readonly listarResenas: ListarResenas,
    private readonly obtenerResena: ObtenerResena,
    private readonly crearResena: CrearResena,
    private readonly obtenerPromedio: ObtenerPromedioResenas,
    private readonly eliminarResena: EliminarResena,
    private readonly actualizarResena: ActualizarResena,
  ) {}

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = await this.listarResenas.ejecutar(req.query as Record<string, unknown>);
      res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof ErrorSolicitud) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof ErrorNoEncontrado) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  obtener = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resena = await this.obtenerResena.ejecutar(req.params.id);
      res.status(200).json({ data: resena });
    } catch (error) {
      if (error instanceof ErrorSolicitud) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof ErrorNoEncontrado) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resena = await this.crearResena.ejecutar(req.body);
      res.status(201).json({ data: resena });
    } catch (error) {
      if (error instanceof ErrorValidacionResena) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof ErrorReferenciaResena) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof ErrorReglaResena) {
        res.status(409).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  promedio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promedio = await this.obtenerPromedio.ejecutar(req.params.showId);
      res.status(200).json({ data: promedio });
    } catch (error) {
      if (error instanceof ErrorSolicitud) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof ErrorNoEncontrado) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  eliminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.eliminarResena.ejecutar(req.params.id);
      res.status(200).json({ message: 'Reseña eliminada' });
    } catch (error) {
      if (error instanceof ErrorSolicitud) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof ErrorNoEncontrado) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  actualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resena = await this.actualizarResena.ejecutar(req.params.id, req.body);
      res.status(200).json({ data: resena });
    } catch (error) {
      if (error instanceof ErrorSolicitud) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof ErrorNoEncontrado) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  };
  
}
