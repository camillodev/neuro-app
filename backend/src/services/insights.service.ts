import { MorningRoutineSession, DailyEmotionalState } from '@prisma/client';
import {
  ReportStatistics,
  ReportInsight,
  ChartData,
  DataPoint,
  ChecklistData
} from '../types';

/**
 * Serviço de Insights - Calcula estatísticas e insights de forma DETERMINÍSTICA
 * SEM uso de IA - apenas lógica e matemática
 */
export class InsightsService {
  /**
   * Calcula todas as estatísticas do relatório
   */
  calculateStatistics(
    routines: MorningRoutineSession[],
    emotionalStates: DailyEmotionalState[]
  ): ReportStatistics {
    const completedRoutines = routines.filter(r => r.completed);
    const durations = completedRoutines
      .map(r => r.durationSeconds)
      .filter((d): d is number => d !== null);

    // Estatísticas de Rotina da Manhã
    const totalMorningRoutines = routines.length;
    const completedMorningRoutines = completedRoutines.length;
    const completionRate = totalMorningRoutines > 0
      ? (completedMorningRoutines / totalMorningRoutines) * 100
      : 0;

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const sortedDurations = [...durations].sort((a, b) => a - b);
    const bestTime = sortedDurations[0] || null;
    const worstTime = sortedDurations[sortedDurations.length - 1] || null;

    const bestTimeSession = completedRoutines.find(r => r.durationSeconds === bestTime);
    const worstTimeSession = completedRoutines.find(r => r.durationSeconds === worstTime);

    // Estatísticas de Ansiedade
    const anxietyScores = emotionalStates.map(e => e.anxietyScore);
    const averageAnxiety = anxietyScores.length > 0
      ? anxietyScores.reduce((sum, a) => sum + a, 0) / anxietyScores.length
      : 0;

    const sortedAnxiety = [...emotionalStates].sort((a, b) => a.anxietyScore - b.anxietyScore);
    const lowestAnxiety = sortedAnxiety[0]?.anxietyScore || null;
    const lowestAnxietyDate = sortedAnxiety[0]?.date || null;
    const highestAnxiety = sortedAnxiety[sortedAnxiety.length - 1]?.anxietyScore || null;
    const highestAnxietyDate = sortedAnxiety[sortedAnxiety.length - 1]?.date || null;

    // Estatísticas do Checklist
    const showerCompletionRate = this.calculateChecklistRate(completedRoutines, 'tookShower');
    const dressedCompletionRate = this.calculateChecklistRate(completedRoutines, 'gotDressed');
    const breakfastCompletionRate = this.calculateChecklistRate(completedRoutines, 'hadBreakfast');
    const medsCompletionRate = this.calculateChecklistRate(completedRoutines, 'tookMeds');

    // Sequências (streaks)
    const { currentStreak, longestStreak } = this.calculateStreaks(routines);

    return {
      totalMorningRoutines,
      completedMorningRoutines,
      completionRate,
      averageDuration,
      bestTime,
      bestTimeDate: bestTimeSession?.startedAt || null,
      worstTime,
      worstTimeDate: worstTimeSession?.startedAt || null,
      averageAnxiety,
      lowestAnxiety,
      lowestAnxietyDate,
      highestAnxiety,
      highestAnxietyDate,
      showerCompletionRate,
      dressedCompletionRate,
      breakfastCompletionRate,
      medsCompletionRate,
      currentStreak,
      longestStreak
    };
  }

  /**
   * Gera insights baseados nos dados (SEM IA)
   */
  generateInsights(
    routines: MorningRoutineSession[],
    emotionalStates: DailyEmotionalState[],
    stats: ReportStatistics
  ): ReportInsight[] {
    const insights: ReportInsight[] = [];

    // Insight 1: Correlação entre ansiedade e duração da manhã
    const anxietyCorrelation = this.analyzeAnxietyDurationCorrelation(
      routines,
      emotionalStates
    );
    if (anxietyCorrelation) {
      insights.push(anxietyCorrelation);
    }

    // Insight 2: Taxa de conclusão
    if (stats.completionRate >= 80) {
      insights.push({
        type: 'achievement',
        title: 'Excelente consistência!',
        description: `Você completou ${stats.completionRate.toFixed(1)}% das rotinas neste período. Continue assim!`,
        severity: 'success'
      });
    } else if (stats.completionRate < 50) {
      insights.push({
        type: 'recommendation',
        title: 'Oportunidade de melhoria',
        description: `Sua taxa de conclusão está em ${stats.completionRate.toFixed(1)}%. Tente definir um horário fixo para a rotina da manhã.`,
        severity: 'warning'
      });
    }

    // Insight 3: Impacto dos remédios na ansiedade
    const medsImpact = this.analyzeMedsImpact(routines, emotionalStates);
    if (medsImpact) {
      insights.push(medsImpact);
    }

    // Insight 4: Melhor tempo
    if (stats.bestTime && stats.bestTimeDate) {
      insights.push({
        type: 'achievement',
        title: 'Seu melhor tempo',
        description: `Seu recorde foi de ${this.formatDuration(stats.bestTime)} no dia ${this.formatDate(stats.bestTimeDate)}.`,
        severity: 'success'
      });
    }

    // Insight 5: Sequência atual
    if (stats.currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Sequência incrível!',
        description: `Você está há ${stats.currentStreak} dias consecutivos completando sua rotina! 🔥`,
        severity: 'success'
      });
    }

    // Insight 6: Padrão de ansiedade alta
    const highAnxietyPattern = this.analyzeHighAnxietyPattern(emotionalStates);
    if (highAnxietyPattern) {
      insights.push(highAnxietyPattern);
    }

    // Insight 7: Checklist mais negligenciado
    const neglectedItem = this.findMostNeglectedChecklistItem(stats);
    if (neglectedItem) {
      insights.push(neglectedItem);
    }

    return insights;
  }

  /**
   * Gera dados para gráficos
   */
  generateChartData(
    routines: MorningRoutineSession[],
    emotionalStates: DailyEmotionalState[]
  ): ChartData {
    // Gráfico de ansiedade ao longo do tempo
    const anxietyOverTime: DataPoint[] = emotionalStates.map(e => ({
      date: e.date.toISOString(),
      value: e.anxietyScore
    }));

    // Gráfico de duração ao longo do tempo
    const durationOverTime: DataPoint[] = routines
      .filter(r => r.completed && r.durationSeconds)
      .map(r => ({
        date: r.startedAt.toISOString(),
        value: r.durationSeconds! / 60 // Converter para minutos
      }));

    // Dados de conclusão do checklist
    const completedRoutines = routines.filter(r => r.completed);
    const checklistCompletion: ChecklistData = {
      labels: ['Banho', 'Vestir', 'Café', 'Remédios'],
      values: [
        this.calculateChecklistRate(completedRoutines, 'tookShower'),
        this.calculateChecklistRate(completedRoutines, 'gotDressed'),
        this.calculateChecklistRate(completedRoutines, 'hadBreakfast'),
        this.calculateChecklistRate(completedRoutines, 'tookMeds')
      ]
    };

    return {
      anxietyOverTime,
      durationOverTime,
      checklistCompletion
    };
  }

  // ===== MÉTODOS AUXILIARES =====

  private calculateChecklistRate(
    routines: MorningRoutineSession[],
    field: 'tookShower' | 'gotDressed' | 'hadBreakfast' | 'tookMeds'
  ): number {
    if (routines.length === 0) return 0;
    const completed = routines.filter(r => r[field]).length;
    return (completed / routines.length) * 100;
  }

  private calculateStreaks(routines: MorningRoutineSession[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    const completedByDate = new Map<string, boolean>();

    routines
      .filter(r => r.completed)
      .forEach(r => {
        const dateKey = r.startedAt.toISOString().split('T')[0];
        completedByDate.set(dateKey, true);
      });

    const sortedDates = Array.from(completedByDate.keys()).sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || this.isConsecutiveDay(sortedDates[i - 1], sortedDates[i])) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }

      longestStreak = Math.max(longestStreak, tempStreak);

      if (sortedDates[i] === today || this.isConsecutiveDay(sortedDates[i], today)) {
        currentStreak = tempStreak;
      }
    }

    return { currentStreak, longestStreak };
  }

  private isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  }

  private analyzeAnxietyDurationCorrelation(
    routines: MorningRoutineSession[],
    emotionalStates: DailyEmotionalState[]
  ): ReportInsight | null {
    const completedRoutines = routines.filter(r => r.completed && r.durationSeconds);

    if (completedRoutines.length < 3) return null;

    // Mapear estados emocionais por data
    const emotionalMap = new Map<string, number>();
    emotionalStates.forEach(e => {
      const dateKey = e.date.toISOString().split('T')[0];
      emotionalMap.set(dateKey, e.anxietyScore);
    });

    // Calcular duração média para ansiedade alta (>6) vs baixa (≤6)
    const highAnxiety: number[] = [];
    const lowAnxiety: number[] = [];

    completedRoutines.forEach(r => {
      const dateKey = r.startedAt.toISOString().split('T')[0];
      const anxiety = emotionalMap.get(dateKey);

      if (anxiety !== undefined && r.durationSeconds) {
        if (anxiety > 6) {
          highAnxiety.push(r.durationSeconds);
        } else {
          lowAnxiety.push(r.durationSeconds);
        }
      }
    });

    if (highAnxiety.length > 0 && lowAnxiety.length > 0) {
      const avgHigh = highAnxiety.reduce((sum, d) => sum + d, 0) / highAnxiety.length;
      const avgLow = lowAnxiety.reduce((sum, d) => sum + d, 0) / lowAnxiety.length;
      const diff = avgHigh - avgLow;

      if (Math.abs(diff) > 60) { // Diferença de mais de 1 minuto
        return {
          type: 'correlation',
          title: 'Correlação: Ansiedade × Duração',
          description: `Nos dias com ansiedade alta (>6), sua rotina leva em média ${this.formatDuration(Math.abs(diff))} ${diff > 0 ? 'a mais' : 'a menos'} que nos dias com ansiedade baixa.`,
          severity: diff > 0 ? 'info' : 'success'
        };
      }
    }

    return null;
  }

  private analyzeMedsImpact(
    routines: MorningRoutineSession[],
    emotionalStates: DailyEmotionalState[]
  ): ReportInsight | null {
    const completedRoutines = routines.filter(r => r.completed);

    if (completedRoutines.length < 5) return null;

    const emotionalMap = new Map<string, number>();
    emotionalStates.forEach(e => {
      const dateKey = e.date.toISOString().split('T')[0];
      emotionalMap.set(dateKey, e.anxietyScore);
    });

    const withMeds: number[] = [];
    const withoutMeds: number[] = [];

    completedRoutines.forEach(r => {
      const dateKey = r.startedAt.toISOString().split('T')[0];
      const anxiety = emotionalMap.get(dateKey);

      if (anxiety !== undefined) {
        if (r.tookMeds) {
          withMeds.push(anxiety);
        } else {
          withoutMeds.push(anxiety);
        }
      }
    });

    if (withMeds.length >= 3 && withoutMeds.length >= 3) {
      const avgWithMeds = withMeds.reduce((sum, a) => sum + a, 0) / withMeds.length;
      const avgWithoutMeds = withoutMeds.reduce((sum, a) => sum + a, 0) / withoutMeds.length;
      const diff = avgWithoutMeds - avgWithMeds;

      if (Math.abs(diff) > 1) {
        return {
          type: 'pattern',
          title: 'Impacto dos Remédios',
          description: `Sua ansiedade média nos dias com remédios foi ${avgWithMeds.toFixed(1)}, enquanto nos dias sem remédios foi ${avgWithoutMeds.toFixed(1)}.`,
          severity: diff > 0 ? 'info' : 'warning'
        };
      }
    }

    return null;
  }

  private analyzeHighAnxietyPattern(
    emotionalStates: DailyEmotionalState[]
  ): ReportInsight | null {
    const highAnxietyDays = emotionalStates.filter(e => e.anxietyScore >= 7);

    if (highAnxietyDays.length >= 3) {
      const percentage = (highAnxietyDays.length / emotionalStates.length) * 100;

      return {
        type: 'pattern',
        title: 'Padrão de Ansiedade Alta',
        description: `Você registrou ansiedade alta (≥7) em ${highAnxietyDays.length} dias (${percentage.toFixed(1)}% do período). Considere conversar com seu terapeuta sobre estratégias adicionais.`,
        severity: 'warning'
      };
    }

    return null;
  }

  private findMostNeglectedChecklistItem(
    stats: ReportStatistics
  ): ReportInsight | null {
    const items = [
      { name: 'tomar banho', rate: stats.showerCompletionRate },
      { name: 'se vestir', rate: stats.dressedCompletionRate },
      { name: 'tomar café', rate: stats.breakfastCompletionRate },
      { name: 'tomar remédios', rate: stats.medsCompletionRate }
    ];

    const sorted = [...items].sort((a, b) => a.rate - b.rate);
    const lowest = sorted[0];

    if (lowest.rate < 70) {
      return {
        type: 'recommendation',
        title: 'Item mais negligenciado',
        description: `Você marcou "${lowest.name}" em apenas ${lowest.rate.toFixed(1)}% das vezes. Tente criar um lembrete para este item.`,
        severity: 'info'
      };
    }

    return null;
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes === 0) {
      return `${secs}s`;
    }

    return secs > 0 ? `${minutes}min${secs}s` : `${minutes}min`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }
}
