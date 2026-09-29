import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import resenasRoutes from './interface/resenas.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/resenas', resenasRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`API de reseñas escuchando en el puerto ${port}`));
