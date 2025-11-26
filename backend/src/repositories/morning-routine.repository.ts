import { MorningRoutineSession } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class MorningRoutineRepository {
  /**
   * Inicia uma nova sessão de rotina da manhã
   */
  async create(userId: string, startedAt: Date): Promise<MorningRoutineSession> {
    return await prisma.morningRoutineSession.create({
      data: {
        userId,
        startedAt,
        completed: false
      }
    });
  }

  /**
   * Finaliza uma sessão de rotina da manhã
   */
  async finish(
    sessionId: string,
    endedAt: Date,
    checklist: {
      tookShower: boolean;
      gotDressed: boolean;
      hadBreakfast: boolean;
      tookMeds: boolean;
    }
  ): Promise<MorningRoutineSession> {
    // Buscar a sessão para calcular duração
    const session = await prisma.morningRoutineSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const durationSeconds = Math.floor(
      (endedAt.getTime() - session.startedAt.getTime()) / 1000
    );

    return await prisma.morningRoutineSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        durationSeconds,
        ...checklist,
        completed: true
      }
    });
  }

  /**
   * Busca sessão ativa (não finalizada) do usuário
   */
  async findActiveSession(userId: string): Promise<MorningRoutineSession | null> {
    return await prisma.morningRoutineSession.findFirst({
      where: {
        userId,
        completed: false,
        endedAt: null
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
  }

  /**
   * Busca sessões em um intervalo de datas
   */
  async findByDateRange(
    userId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<MorningRoutineSession[]> {
    return await prisma.morningRoutineSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: dateFrom,
          lte: dateTo
        },
        completed: true
      },
      orderBy: {
        startedAt: 'asc'
      }
    });
  }

  /**
   * Busca o melhor tempo (menor duração) em um período
   */
  async findBestTime(
    userId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<MorningRoutineSession | null> {
    return await prisma.morningRoutineSession.findFirst({
      where: {
        userId,
        startedAt: {
          gte: dateFrom,
          lte: dateTo
        },
        completed: true,
        durationSeconds: {
          not: null
        }
      },
      orderBy: {
        durationSeconds: 'asc'
      }
    });
  }

  /**
   * Busca sessões de hoje
   */
  async findTodaySessions(userId: string): Promise<MorningRoutineSession[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.morningRoutineSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
  }
}
