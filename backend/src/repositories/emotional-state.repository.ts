import { DailyEmotionalState } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class EmotionalStateRepository {
  /**
   * Salva ou atualiza o estado emocional de um dia
   */
  async upsert(
    userId: string,
    date: Date,
    anxietyScore: number,
    notes?: string
  ): Promise<DailyEmotionalState> {
    // Normalizar data para início do dia
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return await prisma.dailyEmotionalState.upsert({
      where: {
        userId_date: {
          userId,
          date: normalizedDate
        }
      },
      update: {
        anxietyScore,
        notes
      },
      create: {
        userId,
        date: normalizedDate,
        anxietyScore,
        notes
      }
    });
  }

  /**
   * Busca estado emocional de um dia específico
   */
  async findByDate(userId: string, date: Date): Promise<DailyEmotionalState | null> {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return await prisma.dailyEmotionalState.findUnique({
      where: {
        userId_date: {
          userId,
          date: normalizedDate
        }
      }
    });
  }

  /**
   * Busca estados emocionais em um intervalo de datas
   */
  async findByDateRange(
    userId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<DailyEmotionalState[]> {
    return await prisma.dailyEmotionalState.findMany({
      where: {
        userId,
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  /**
   * Busca o estado emocional de hoje
   */
  async findToday(userId: string): Promise<DailyEmotionalState | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.dailyEmotionalState.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });
  }
}
