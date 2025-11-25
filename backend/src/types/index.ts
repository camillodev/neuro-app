// Tipos compartilhados do backend

export interface AuthenticatedRequest extends Express.Request {
  userId?: string;
  clerkId?: string;
}

// DTOs para Rotina da Manhã
export interface StartMorningRoutineDTO {
  startedAt: Date;
}

export interface FinishMorningRoutineDTO {
  sessionId: string;
  endedAt: Date;
  tookShower: boolean;
  gotDressed: boolean;
  hadBreakfast: boolean;
  tookMeds: boolean;
}

// DTOs para Estado Emocional
export interface SaveEmotionalStateDTO {
  date: Date;
  anxietyScore: number; // 0-10
  notes?: string;
}

// DTOs para Relatórios
export interface ReportFilterDTO {
  dateFrom: Date;
  dateTo: Date;
}

export interface ReportSummaryResponse {
  userId: string;
  userName: string;
  period: {
    from: Date;
    to: Date;
  };
  statistics: ReportStatistics;
  insights: ReportInsight[];
  charts: ChartData;
}

export interface ReportStatistics {
  // Estatísticas da Rotina da Manhã
  totalMorningRoutines: number;
  completedMorningRoutines: number;
  completionRate: number; // Percentual
  averageDuration: number; // em segundos
  bestTime: number | null; // melhor tempo em segundos
  bestTimeDate: Date | null;
  worstTime: number | null;
  worstTimeDate: Date | null;

  // Estatísticas de Ansiedade
  averageAnxiety: number; // 0-10
  lowestAnxiety: number | null;
  lowestAnxietyDate: Date | null;
  highestAnxiety: number | null;
  highestAnxietyDate: Date | null;

  // Estatísticas do Checklist
  showerCompletionRate: number;
  dressedCompletionRate: number;
  breakfastCompletionRate: number;
  medsCompletionRate: number;

  // Sequências
  currentStreak: number; // dias consecutivos com rotina completa
  longestStreak: number;
}

export interface ReportInsight {
  type: 'correlation' | 'achievement' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  severity?: 'info' | 'warning' | 'success';
}

export interface ChartData {
  anxietyOverTime: DataPoint[];
  durationOverTime: DataPoint[];
  checklistCompletion: ChecklistData;
}

export interface DataPoint {
  date: string; // ISO string
  value: number;
}

export interface ChecklistData {
  labels: string[];
  values: number[];
}

// DTO para criar token de compartilhamento
export interface CreateShareTokenDTO {
  dateFrom: Date;
  dateTo: Date;
  expiresAt?: Date;
}

export interface ShareTokenResponse {
  token: string;
  publicUrl: string;
  expiresAt?: Date;
}
