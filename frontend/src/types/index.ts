// Tipos compartilhados do frontend

export interface MorningRoutineSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  tookShower: boolean;
  gotDressed: boolean;
  hadBreakfast: boolean;
  tookMeds: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyEmotionalState {
  id: string;
  userId: string;
  date: string;
  anxietyScore: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSummary {
  userId: string;
  userName: string;
  period: {
    from: string;
    to: string;
  };
  statistics: ReportStatistics;
  insights: ReportInsight[];
  charts: ChartData;
}

export interface ReportStatistics {
  totalMorningRoutines: number;
  completedMorningRoutines: number;
  completionRate: number;
  averageDuration: number;
  bestTime: number | null;
  bestTimeDate: string | null;
  worstTime: number | null;
  worstTimeDate: string | null;
  averageAnxiety: number;
  lowestAnxiety: number | null;
  lowestAnxietyDate: string | null;
  highestAnxiety: number | null;
  highestAnxietyDate: string | null;
  showerCompletionRate: number;
  dressedCompletionRate: number;
  breakfastCompletionRate: number;
  medsCompletionRate: number;
  currentStreak: number;
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
  date: string;
  value: number;
}

export interface ChecklistData {
  labels: string[];
  values: number[];
}

export interface ShareToken {
  token: string;
  publicUrl: string;
  expiresAt?: string;
}

// ===== DTOs =====

export interface StartRoutineDTO {
  startedAt: string;
}

export interface FinishRoutineDTO {
  sessionId: string;
  endedAt: string;
  tookShower: boolean;
  gotDressed: boolean;
  hadBreakfast: boolean;
  tookMeds: boolean;
}

export interface SaveEmotionalStateDTO {
  date: string;
  anxietyScore: number;
  notes?: string;
}

export interface ReportFilterDTO {
  dateFrom: string;
  dateTo: string;
}

export interface CreateShareTokenDTO {
  dateFrom: string;
  dateTo: string;
  expiresAt?: string;
}
