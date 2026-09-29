import type { ResenasRepository } from '../../../domain/resenas.repository.js';
import type { Resena } from '../../../domain/resena.js';

export class DeleteResenaUseCase {
  constructor(private readonly repo: ResenasRepository<Resena>) {}

  async execute(id: number): Promise<void> {
    const resena = await this.repo.findById(id);
    
    if (!resena) {
      const error: any = new Error('La resena no existe o ya fue eliminada');
      error.statusCode = 404;
      throw error;
    }

    await this.repo.delete(id);
  }
}