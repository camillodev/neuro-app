import { MorningRoutineSession } from '@prisma/client';
import { MorningRoutineRepository } from '../repositories/morning-routine.repository';
import { UserRepository } from '../repositories/user.repository';
import { FinishMorningRoutineDTO } from '../types';

export class MorningRoutineService {
  private routineRepo: MorningRoutineRepository;
  private userRepo: UserRepository;

  constructor() {
    this.routineRepo = new MorningRoutineRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * Inicia uma nova sessão de rotina da manhã
   */
  async startRoutine(clerkId: string): Promise<MorningRoutineSession> {
    // Garantir que o usuário existe
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se já existe uma sessão ativa
    const activeSession = await this.routineRepo.findActiveSession(user.id);
    if (activeSession) {
      return activeSession; // Retornar sessão existente ao invés de criar uma nova
    }

    // Criar nova sessão
    const startedAt = new Date();
    return await this.routineRepo.create(user.id, startedAt);
  }

  /**
   * Finaliza a sessão de rotina da manhã
   */
  async finishRoutine(
    clerkId: string,
    data: FinishMorningRoutineDTO
  ): Promise<MorningRoutineSession> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Validar checklist - todos os itens devem estar marcados
    if (!data.tookShower || !data.gotDressed || !data.hadBreakfast || !data.tookMeds) {
      throw new Error('Todos os itens do checklist devem ser marcados antes de finalizar');
    }

    return await this.routineRepo.finish(
      data.sessionId,
      data.endedAt,
      {
        tookShower: data.tookShower,
        gotDressed: data.gotDressed,
        hadBreakfast: data.hadBreakfast,
        tookMeds: data.tookMeds
      }
    );
  }

  /**
   * Busca sessão ativa do usuário
   */
  async getActiveSession(clerkId: string): Promise<MorningRoutineSession | null> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return await this.routineRepo.findActiveSession(user.id);
  }

  /**
   * Busca sessões de hoje
   */
  async getTodaySessions(clerkId: string): Promise<MorningRoutineSession[]> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return await this.routineRepo.findTodaySessions(user.id);
  }

  /**
   * Busca o melhor tempo da semana
   */
  async getBestTimeThisWeek(clerkId: string): Promise<MorningRoutineSession | null> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return await this.routineRepo.findBestTime(user.id, weekAgo, today);
  }
}
