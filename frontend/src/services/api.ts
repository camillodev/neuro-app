import axios, { AxiosInstance } from 'axios';
import {
  MorningRoutineSession,
  DailyEmotionalState,
  ReportSummary,
  ShareToken,
  FinishRoutineDTO,
  SaveEmotionalStateDTO,
  ReportFilterDTO,
  CreateShareTokenDTO
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private client: AxiosInstance;
  private getTokenFn: (() => Promise<string | null>) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Método para configurar a função de obtenção de token (será chamado pelo componente App)
  setTokenProvider(getTokenFn: () => Promise<string | null>) {
    this.getTokenFn = getTokenFn;
  }

  // Método para obter token do Clerk
  private async getAuthToken(): Promise<string | null> {
    if (this.getTokenFn) {
      return await this.getTokenFn();
    }
    return null;
  }

  // ===== ROTINA DA MANHÃ =====

  async startMorningRoutine(): Promise<MorningRoutineSession> {
    const response = await this.client.post('/morning-routine/start');
    return response.data.data;
  }

  async finishMorningRoutine(data: FinishRoutineDTO): Promise<MorningRoutineSession> {
    const response = await this.client.post('/morning-routine/finish', data);
    return response.data.data;
  }

  async getActiveSession(): Promise<MorningRoutineSession | null> {
    const response = await this.client.get('/morning-routine/active');
    return response.data.data;
  }

  async getTodaySessions(): Promise<MorningRoutineSession[]> {
    const response = await this.client.get('/morning-routine/today');
    return response.data.data;
  }

  async getBestTimeThisWeek(): Promise<MorningRoutineSession | null> {
    const response = await this.client.get('/morning-routine/best-time-week');
    return response.data.data;
  }

  // ===== ESTADO EMOCIONAL =====

  async saveEmotionalState(data: SaveEmotionalStateDTO): Promise<DailyEmotionalState> {
    const response = await this.client.post('/emotional-state/save', data);
    return response.data.data;
  }

  async getTodayEmotionalState(): Promise<DailyEmotionalState | null> {
    const response = await this.client.get('/emotional-state/today');
    return response.data.data;
  }

  async getEmotionalStateByDate(date: string): Promise<DailyEmotionalState | null> {
    const response = await this.client.get(`/emotional-state/date/${date}`);
    return response.data.data;
  }

  // ===== RELATÓRIOS =====

  async getReportSummary(filter: ReportFilterDTO): Promise<ReportSummary> {
    const response = await this.client.post('/reports/summary', filter);
    return response.data.data;
  }

  async exportReportPDF(filter: ReportFilterDTO): Promise<Blob> {
    const response = await this.client.post('/reports/export', filter, {
      responseType: 'blob',
    });
    return response.data;
  }

  async createShareToken(data: CreateShareTokenDTO): Promise<ShareToken> {
    const response = await this.client.post('/reports/share', data);
    return response.data.data;
  }

  async getPublicReport(token: string): Promise<ReportSummary> {
    const response = await this.client.get(`/reports/public/${token}`);
    return response.data.data;
  }

  async getShareTokens(): Promise<any[]> {
    const response = await this.client.get('/reports/tokens');
    return response.data.data;
  }

  async deleteShareToken(tokenId: string): Promise<void> {
    await this.client.delete(`/reports/tokens/${tokenId}`);
  }
}

export default new ApiService();
