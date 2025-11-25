import { useState, useEffect } from 'react';
import { format, subDays, subMonths } from 'date-fns';
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

type PeriodPreset = 'week' | 'month' | 'custom';

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodPreset>('week');
  const [dateFrom, setDateFrom] = useState<string>(
    format(subDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [dateTo, setDateTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const handlePeriodChange = (newPeriod: PeriodPreset) => {
    setPeriod(newPeriod);

    const today = new Date();
    if (newPeriod === 'week') {
      setDateFrom(format(subDays(today, 7), 'yyyy-MM-dd'));
      setDateTo(format(today, 'yyyy-MM-dd'));
    } else if (newPeriod === 'month') {
      setDateFrom(format(subMonths(today, 1), 'yyyy-MM-dd'));
      setDateTo(format(today, 'yyyy-MM-dd'));
    }
  };

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const summary = await api.getReportSummary({
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
      });
      setReport(summary);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      alert('Erro ao carregar relatório. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdfBlob = await api.exportReportPDF({
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
      });

      // Download do PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `neuroapp-relatorio-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    }
  };

  const handleCreateShareLink = async () => {
    try {
      const shareToken = await api.createShareToken({
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
      });
      setShareUrl(shareToken.publicUrl);
      setShowShareModal(true);
    } catch (error) {
      console.error('Erro ao criar link:', error);
      alert('Erro ao criar link de compartilhamento. Tente novamente.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Relatórios Clínicos
        </h1>

        {/* Filtros */}
        <div className="space-y-4">
          {/* Presets de Período */}
          <div className="flex gap-3">
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Última Semana
            </button>

            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Último Mês
            </button>

            <button
              onClick={() => handlePeriodChange('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === 'custom'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Personalizado
            </button>
          </div>

          {/* Seletor de Datas */}
          {period === 'custom' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button onClick={loadReport} className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Gerar Relatório'}
            </button>

            {report && (
              <>
                <button onClick={handleExportPDF} className="btn-secondary">
                  📥 Exportar PDF
                </button>

                <button onClick={handleCreateShareLink} className="btn-secondary">
                  🔗 Gerar Link Público
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      {report && (
        <>
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
        </>
      )}

      {/* Modal de Compartilhamento */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Link Público Criado!
            </h3>

            <p className="text-gray-600 mb-4">
              Compartilhe este link para que outras pessoas possam ver seu relatório (somente leitura):
            </p>

            <div className="p-3 bg-gray-100 rounded-lg mb-4 break-all text-sm">
              {shareUrl}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copiado!');
                }}
                className="btn-primary flex-1"
              >
                Copiar Link
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="btn-secondary flex-1"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
