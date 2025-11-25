import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { ReportSummary } from '../types';

export default function PublicReportPage() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicReport();
  }, [token]);

  const loadPublicReport = async () => {
    if (!token) {
      setError('Token não fornecido');
      setIsLoading(false);
      return;
    }

    try {
      const summary = await api.getPublicReport(token);
      setReport(summary);
    } catch (error) {
      console.error('Erro ao carregar relatório público:', error);
      setError('Relatório não encontrado ou token expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}min`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'correlation':
        return '📊';
      case 'pattern':
        return '🔍';
      case 'recommendation':
        return '💡';
      default:
        return '📌';
    }
  };

  const getInsightColor = (severity?: string) => {
    switch (severity) {
      case 'success':
        return 'bg-success-50 border-success-300 text-success-800';
      case 'warning':
        return 'bg-warning-50 border-warning-300 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-300 text-primary-800';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Relatório não encontrado
          </h1>
          <p className="text-gray-600">
            {error || 'Este relatório não existe ou o link expirou.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-center py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient mb-2">NeuroApp</h1>
            <p className="text-gray-600">Relatório Compartilhado (Somente Leitura)</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container-center py-8 space-y-6">
        {/* Info do Relatório */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Relatório de {report.userName}
          </h2>
          <p className="text-gray-600">
            Período: {format(new Date(report.period.from), "dd 'de' MMMM", { locale: ptBR })} até{' '}
            {format(new Date(report.period.to), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Taxa de Conclusão</p>
            <p className="text-3xl font-bold text-primary-600">
              {report.statistics.completionRate.toFixed(1)}%
            </p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Duração Média</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatDuration(report.statistics.averageDuration)}
            </p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Ansiedade Média</p>
            <p className="text-3xl font-bold text-primary-600">
              {report.statistics.averageAnxiety.toFixed(1)}/10
            </p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Sequência Atual</p>
            <p className="text-3xl font-bold text-primary-600">
              {report.statistics.currentStreak} dias
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Ansiedade */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ansiedade ao Longo do Tempo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.charts.anxietyOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    format(new Date(date), 'dd/MM', { locale: ptBR })
                  }
                />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  labelFormatter={(date) =>
                    format(new Date(date), "dd 'de' MMMM", { locale: ptBR })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Ansiedade"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Duração */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Duração da Rotina (minutos)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.charts.durationOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    format(new Date(date), 'dd/MM', { locale: ptBR })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) =>
                    format(new Date(date), "dd 'de' MMMM", { locale: ptBR })
                  }
                />
                <Legend />
                <Bar dataKey="value" name="Duração (min)" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Checklist Completion */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Taxa de Conclusão do Checklist
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.charts.checklistCompletion.labels.map((label, index) => (
              <div key={label} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{label}</p>
                <p className="text-2xl font-bold text-primary-600">
                  {report.charts.checklistCompletion.values[index].toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {report.insights.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Insights e Conclusões
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Gerados automaticamente por análise determinística (sem uso de IA)
            </p>

            <div className="space-y-3">
              {report.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg ${getInsightColor(insight.severity)}`}
                >
                  <h4 className="font-semibold mb-1">
                    {getInsightIcon(insight.type)} {insight.title}
                  </h4>
                  <p className="text-sm">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="container-center py-6 text-center text-sm text-gray-600">
          <p>NeuroApp - Relatório compartilhado</p>
          <p className="mt-2">
            Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </footer>
    </div>
  );
}
