import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { PDFGenerator } from '../utils/pdf-generator';
import { AuthenticatedRequest, ReportFilterDTO, CreateShareTokenDTO } from '../types';

const service = new ReportService();
const pdfGenerator = new PDFGenerator();

export class ReportController {
  /**
   * POST /api/reports/summary
   * Gera resumo do relatório
   */
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const filter: ReportFilterDTO = {
        dateFrom: new Date(req.body.dateFrom),
        dateTo: new Date(req.body.dateTo)
      };

      const summary = await service.generateSummary(clerkId, filter);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      res.status(500).json({
        error: 'Erro ao gerar resumo',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * POST /api/reports/export
   * Exporta relatório em PDF
   */
  async exportPDF(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const filter: ReportFilterDTO = {
        dateFrom: new Date(req.body.dateFrom),
        dateTo: new Date(req.body.dateTo)
      };

      const summary = await service.generateSummary(clerkId, filter);
      const pdfBuffer = await pdfGenerator.generateReportPDF(summary);

      // Definir headers para download do PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=neuroapp-relatorio-${Date.now()}.pdf`
      );

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      res.status(500).json({
        error: 'Erro ao exportar PDF',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * POST /api/reports/share
   * Cria token de compartilhamento público
   */
  async createShareToken(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const data: CreateShareTokenDTO = {
        dateFrom: new Date(req.body.dateFrom),
        dateTo: new Date(req.body.dateTo),
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined
      };

      const shareToken = await service.createShareToken(clerkId, data);

      res.status(200).json({
        success: true,
        data: shareToken
      });
    } catch (error) {
      console.error('Erro ao criar token:', error);
      res.status(500).json({
        error: 'Erro ao criar token de compartilhamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/reports/public/:token
   * Acessa relatório público via token (não requer autenticação)
   */
  async getPublicReport(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token;

      const report = await service.getPublicReport(token);

      if (!report) {
        res.status(404).json({
          error: 'Relatório não encontrado ou token expirado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Erro ao buscar relatório público:', error);
      res.status(500).json({
        error: 'Erro ao buscar relatório',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/reports/tokens
   * Lista tokens de compartilhamento do usuário
   */
  async getShareTokens(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const tokens = await service.getUserShareTokens(clerkId);

      res.status(200).json({
        success: true,
        data: tokens
      });
    } catch (error) {
      console.error('Erro ao listar tokens:', error);
      res.status(500).json({
        error: 'Erro ao listar tokens',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * DELETE /api/reports/tokens/:tokenId
   * Deleta um token de compartilhamento
   */
  async deleteShareToken(req: Request, res: Response): Promise<void> {
    try {
      const clerkId = (req as AuthenticatedRequest).clerkId;

      if (!clerkId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const tokenId = req.params.tokenId;

      await service.deleteShareToken(clerkId, tokenId);

      res.status(200).json({
        success: true,
        message: 'Token deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar token:', error);
      res.status(500).json({
        error: 'Erro ao deletar token',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
