import { DailyEmotionalState } from '@prisma/client';
import { EmotionalStateRepository } from '../repositories/emotional-state.repository';
import { UserRepository } from '../repositories/user.repository';
import { SaveEmotionalStateDTO } from '../types';

export class EmotionalStateService {
  private emotionalRepo: EmotionalStateRepository;
  private userRepo: UserRepository;

  constructor() {
    this.emotionalRepo = new EmotionalStateRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * Salva o estado emocional do dia
   */
  async saveState(
    clerkId: string,
    data: SaveEmotionalStateDTO
  ): Promise<DailyEmotionalState> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Validar score de ansiedade (0-10)
    if (data.anxietyScore < 0 || data.anxietyScore > 10) {
      throw new Error('Score de ansiedade deve estar entre 0 e 10');
    }

    return await this.emotionalRepo.upsert(
      user.id,
      data.date,
      data.anxietyScore,
      data.notes
    );
  }

  /**
   * Busca estado emocional de hoje
   */
  async getTodayState(clerkId: string): Promise<DailyEmotionalState | null> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return await this.emotionalRepo.findToday(user.id);
  }

  /**
   * Busca estado emocional de uma data específica
   */
  async getStateByDate(
    clerkId: string,
    date: Date
  ): Promise<DailyEmotionalState | null> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return await this.emotionalRepo.findByDate(user.id, date);
  }
}
