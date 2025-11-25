import { Request, Response } from 'express';
import { EmotionalStateService } from '../services/emotional-state.service';
import { AuthenticatedRequest, SaveEmotionalStateDTO } from '../types';

const service = new EmotionalStateService();

export class EmotionalStateController {
  /**
   * POST /api/emotional-state/save
   * Salva estado emocional do dia
   */
  async save(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const data: SaveEmotionalStateDTO = {
        date: req.body.date ? new Date(req.body.date) : new Date(),
        anxietyScore: req.body.anxietyScore,
        notes: req.body.notes
      };

      const state = await service.saveState(clerkId, data);

      res.status(200).json({
        success: true,
        data: state
      });
    } catch (error) {
      console.error('Erro ao salvar estado emocional:', error);
      res.status(400).json({
        error: 'Erro ao salvar estado emocional',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/emotional-state/today
   * Busca estado emocional de hoje
   */
  async getToday(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const state = await service.getTodayState(clerkId);

      res.status(200).json({
        success: true,
        data: state
      });
    } catch (error) {
      console.error('Erro ao buscar estado emocional:', error);
      res.status(500).json({
        error: 'Erro ao buscar estado emocional',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/emotional-state/date/:date
   * Busca estado emocional de uma data específica
   */
  async getByDate(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const date = new Date(req.params.date);

      const state = await service.getStateByDate(clerkId, date);

      res.status(200).json({
        success: true,
        data: state
      });
    } catch (error) {
      console.error('Erro ao buscar estado emocional:', error);
      res.status(500).json({
        error: 'Erro ao buscar estado emocional',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
