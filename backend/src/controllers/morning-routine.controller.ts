import { Request, Response } from 'express';
import { MorningRoutineService } from '../services/morning-routine.service';
import { AuthenticatedRequest, FinishMorningRoutineDTO } from '../types';

const service = new MorningRoutineService();

export class MorningRoutineController {
  /**
   * POST /api/morning-routine/start
   * Inicia uma nova sessão de rotina da manhã
   */
  async start(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const session = await service.startRoutine(clerkId);

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Erro ao iniciar rotina:', error);
      res.status(500).json({
        error: 'Erro ao iniciar rotina',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * POST /api/morning-routine/finish
   * Finaliza a sessão de rotina da manhã
   */
  async finish(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const data: FinishMorningRoutineDTO = {
        sessionId: req.body.sessionId,
        endedAt: new Date(req.body.endedAt),
        tookShower: req.body.tookShower,
        gotDressed: req.body.gotDressed,
        hadBreakfast: req.body.hadBreakfast,
        tookMeds: req.body.tookMeds
      };

      const session = await service.finishRoutine(clerkId, data);

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Erro ao finalizar rotina:', error);
      res.status(400).json({
        error: 'Erro ao finalizar rotina',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/morning-routine/active
   * Busca sessão ativa
   */
  async getActive(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const session = await service.getActiveSession(clerkId);

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Erro ao buscar sessão ativa:', error);
      res.status(500).json({
        error: 'Erro ao buscar sessão ativa',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/morning-routine/today
   * Busca sessões de hoje
   */
  async getToday(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const sessions = await service.getTodaySessions(clerkId);

      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Erro ao buscar sessões de hoje:', error);
      res.status(500).json({
        error: 'Erro ao buscar sessões de hoje',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/morning-routine/best-time-week
   * Busca melhor tempo da semana
   */
  async getBestTimeWeek(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const bestTime = await service.getBestTimeThisWeek(clerkId);

      res.status(200).json({
        success: true,
        data: bestTime
      });
    } catch (error) {
      console.error('Erro ao buscar melhor tempo:', error);
      res.status(500).json({
        error: 'Erro ao buscar melhor tempo',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
