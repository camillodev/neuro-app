import { MorningRoutineRepository } from '../repositories/morning-routine.repository';
import { EmotionalStateRepository } from '../repositories/emotional-state.repository';
import { ReportTokenRepository } from '../repositories/report-token.repository';
import { UserRepository } from '../repositories/user.repository';
import { InsightsService } from './insights.service';
import {
  ReportFilterDTO,
  ReportSummaryResponse,
  CreateShareTokenDTO,
  ShareTokenResponse
} from '../types';

export class ReportService {
  private routineRepo: MorningRoutineRepository;
  private emotionalRepo: EmotionalStateRepository;
  private tokenRepo: ReportTokenRepository;
  private userRepo: UserRepository;
  private insightsService: InsightsService;

  constructor() {
    this.routineRepo = new MorningRoutineRepository();
    this.emotionalRepo = new EmotionalStateRepository();
    this.tokenRepo = new ReportTokenRepository();
    this.userRepo = new UserRepository();
    this.insightsService = new InsightsService();
  }

  /**
   * Gera resumo do relatório para um período
   */
  async generateSummary(
    clerkId: string,
    filter: ReportFilterDTO
  ): Promise<ReportSummaryResponse> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar dados do período
    const routines = await this.routineRepo.findByDateRange(
      user.id,
      filter.dateFrom,
      filter.dateTo
    );

    const emotionalStates = await this.emotionalRepo.findByDateRange(
      user.id,
      filter.dateFrom,
      filter.dateTo
    );

    // Calcular estatísticas
    const statistics = this.insightsService.calculateStatistics(
      routines,
      emotionalStates
    );

    // Gerar insights
    const insights = this.insightsService.generateInsights(
      routines,
      emotionalStates,
      statistics
    );

    // Gerar dados dos gráficos
    const charts = this.insightsService.generateChartData(
      routines,
      emotionalStates
    );

    return {
      userId: user.id,
      userName: user.name || user.email,
      period: {
        from: filter.dateFrom,
        to: filter.dateTo
      },
      statistics,
      insights,
      charts
    };
  }

  /**
   * Cria um token de compartilhamento público
   */
  async createShareToken(
    clerkId: string,
    data: CreateShareTokenDTO
  ): Promise<ShareTokenResponse> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const shareToken = await this.tokenRepo.create(
      user.id,
      data.dateFrom,
      data.dateTo,
      data.expiresAt
    );

    const publicUrl = `${process.env.PUBLIC_URL}/api/reports/public/${shareToken.token}`;

    return {
      token: shareToken.token,
      publicUrl,
      expiresAt: shareToken.expiresAt || undefined
    };
  }

  /**
   * Busca relatório por token público
   */
  async getPublicReport(token: string): Promise<ReportSummaryResponse | null> {
    const shareToken = await this.tokenRepo.findByToken(token);

    if (!shareToken) {
      return null;
    }

    // Buscar dados do usuário e do período definido no token
    const routines = await this.routineRepo.findByDateRange(
      shareToken.userId,
      shareToken.dateFrom,
      shareToken.dateTo
    );

    const emotionalStates = await this.emotionalRepo.findByDateRange(
      shareToken.userId,
      shareToken.dateFrom,
      shareToken.dateTo
    );

    const user = await this.userRepo.findById(shareToken.userId);

    if (!user) {
      return null;
    }

    // Calcular estatísticas
    const statistics = this.insightsService.calculateStatistics(
      routines,
      emotionalStates
    );

    // Gerar insights
    const insights = this.insightsService.generateInsights(
      routines,
      emotionalStates,
      statistics
    );

    // Gerar dados dos gráficos
    const charts = this.insightsService.generateChartData(
      routines,
      emotionalStates
    );

    return {
      userId: user.id,
      userName: user.name || user.email,
      period: {
        from: shareToken.dateFrom,
        to: shareToken.dateTo
      },
      statistics,
      insights,
      charts
    };
  }

  /**
   * Lista tokens de compartilhamento do usuário
   */
  async getUserShareTokens(clerkId: string) {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return await this.tokenRepo.findByUserId(user.id);
  }

  /**
   * Deleta um token de compartilhamento
   */
  async deleteShareToken(clerkId: string, tokenId: string): Promise<void> {
    const user = await this.userRepo.findByClerkId(clerkId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o token pertence ao usuário
    const tokens = await this.tokenRepo.findByUserId(user.id);
    const tokenExists = tokens.some(t => t.id === tokenId);

    if (!tokenExists) {
      throw new Error('Token não encontrado ou não pertence ao usuário');
    }

    await this.tokenRepo.delete(tokenId);
  }
}
