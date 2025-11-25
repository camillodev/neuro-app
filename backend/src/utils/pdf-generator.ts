import PDFDocument from 'pdfkit';
import { ReportSummaryResponse } from '../types';

/**
 * Gera PDF do relatório usando PDFKit
 * Não usa IA - apenas formatação de dados
 */
export class PDFGenerator {
  /**
   * Gera buffer do PDF a partir dos dados do relatório
   */
  async generateReportPDF(report: ReportSummaryResponse): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // HEADER
        this.addHeader(doc, report);

        // PERÍODO
        this.addPeriod(doc, report);

        // ESTATÍSTICAS
        this.addStatistics(doc, report);

        // INSIGHTS
        this.addInsights(doc, report);

        // DADOS DOS GRÁFICOS (em formato de tabela)
        this.addChartData(doc, report);

        // FOOTER
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, report: ReportSummaryResponse): void {
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('NeuroApp - Relatório Clínico', { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(`Usuário: ${report.userName}`, { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
  }

  private addPeriod(doc: PDFKit.PDFDocument, report: ReportSummaryResponse): void {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Período do Relatório:');

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(
        `De ${this.formatDate(report.period.from)} até ${this.formatDate(report.period.to)}`
      );

    doc.moveDown(1.5);
  }

  private addStatistics(doc: PDFKit.PDFDocument, report: ReportSummaryResponse): void {
    const stats = report.statistics;

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Estatísticas', { underline: true });

    doc.moveDown(0.5);

    // Rotina da Manhã
    doc.fontSize(13).font('Helvetica-Bold').text('Rotina da Manhã:');
    doc.fontSize(10).font('Helvetica');

    doc.text(`• Total de rotinas: ${stats.totalMorningRoutines}`);
    doc.text(`• Rotinas completadas: ${stats.completedMorningRoutines}`);
    doc.text(`• Taxa de conclusão: ${stats.completionRate.toFixed(1)}%`);
    doc.text(`• Duração média: ${this.formatDuration(stats.averageDuration)}`);

    if (stats.bestTime) {
      doc.text(
        `• Melhor tempo: ${this.formatDuration(stats.bestTime)} (${this.formatDate(stats.bestTimeDate!)})`
      );
    }

    if (stats.currentStreak > 0) {
      doc.text(`• Sequência atual: ${stats.currentStreak} dias consecutivos`);
    }

    if (stats.longestStreak > 0) {
      doc.text(`• Maior sequência: ${stats.longestStreak} dias`);
    }

    doc.moveDown(1);

    // Ansiedade
    doc.fontSize(13).font('Helvetica-Bold').text('Ansiedade:');
    doc.fontSize(10).font('Helvetica');

    doc.text(`• Média do período: ${stats.averageAnxiety.toFixed(1)}/10`);

    if (stats.lowestAnxiety !== null) {
      doc.text(
        `• Menor ansiedade: ${stats.lowestAnxiety}/10 (${this.formatDate(stats.lowestAnxietyDate!)})`
      );
    }

    if (stats.highestAnxiety !== null) {
      doc.text(
        `• Maior ansiedade: ${stats.highestAnxiety}/10 (${this.formatDate(stats.highestAnxietyDate!)})`
      );
    }

    doc.moveDown(1);

    // Checklist
    doc.fontSize(13).font('Helvetica-Bold').text('Taxa de Conclusão do Checklist:');
    doc.fontSize(10).font('Helvetica');

    doc.text(`• Banho: ${stats.showerCompletionRate.toFixed(1)}%`);
    doc.text(`• Vestir: ${stats.dressedCompletionRate.toFixed(1)}%`);
    doc.text(`• Café da manhã: ${stats.breakfastCompletionRate.toFixed(1)}%`);
    doc.text(`• Remédios: ${stats.medsCompletionRate.toFixed(1)}%`);

    doc.moveDown(2);
  }

  private addInsights(doc: PDFKit.PDFDocument, report: ReportSummaryResponse): void {
    if (report.insights.length === 0) {
      return;
    }

    // Verificar se precisamos de nova página
    if (doc.y > 600) {
      doc.addPage();
    }

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Insights e Conclusões', { underline: true });

    doc.moveDown(0.5);

    doc.fontSize(9).font('Helvetica-Oblique').text(
      '(Gerados automaticamente por análise determinística, sem uso de IA)',
      { align: 'left' }
    );

    doc.moveDown(0.5);

    report.insights.forEach((insight, index) => {
      // Verificar espaço disponível
      if (doc.y > 680) {
        doc.addPage();
      }

      doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${insight.title}`);
      doc.fontSize(10).font('Helvetica').text(insight.description, {
        indent: 15
      });
      doc.moveDown(0.8);
    });

    doc.moveDown(1);
  }

  private addChartData(doc: PDFKit.PDFDocument, report: ReportSummaryResponse): void {
    // Adicionar nova página para os dados dos gráficos
    doc.addPage();

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Dados dos Gráficos', { underline: true });

    doc.moveDown(1);

    // Ansiedade ao longo do tempo (últimos 10 registros)
    if (report.charts.anxietyOverTime.length > 0) {
      doc.fontSize(13).font('Helvetica-Bold').text('Ansiedade ao Longo do Tempo:');
      doc.fontSize(9).font('Helvetica');

      const anxietyData = report.charts.anxietyOverTime.slice(-10);

      anxietyData.forEach(point => {
        doc.text(
          `• ${this.formatDate(new Date(point.date))}: ${point.value}/10`
        );
      });

      doc.moveDown(1.5);
    }

    // Duração da manhã ao longo do tempo (últimos 10 registros)
    if (report.charts.durationOverTime.length > 0) {
      doc.fontSize(13).font('Helvetica-Bold').text('Duração da Rotina ao Longo do Tempo:');
      doc.fontSize(9).font('Helvetica');

      const durationData = report.charts.durationOverTime.slice(-10);

      durationData.forEach(point => {
        doc.text(
          `• ${this.formatDate(new Date(point.date))}: ${point.value.toFixed(1)} minutos`
        );
      });

      doc.moveDown(1.5);
    }

    // Conclusão do Checklist
    doc.fontSize(13).font('Helvetica-Bold').text('Taxa de Conclusão do Checklist:');
    doc.fontSize(9).font('Helvetica');

    report.charts.checklistCompletion.labels.forEach((label, index) => {
      const value = report.charts.checklistCompletion.values[index];
      doc.text(`• ${label}: ${value.toFixed(1)}%`);
    });

    doc.moveDown(2);
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    const pageCount = doc.bufferedPageRange().count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .text(
          `Gerado pelo NeuroApp em ${new Date().toLocaleString('pt-BR')}`,
          50,
          doc.page.height - 50,
          {
            align: 'center'
          }
        );

      doc.text(
        `Página ${i + 1} de ${pageCount}`,
        50,
        doc.page.height - 35,
        {
          align: 'center'
        }
      );
    }
  }

  // Métodos auxiliares
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes === 0) {
      return `${secs}s`;
    }

    return secs > 0 ? `${minutes}min ${secs}s` : `${minutes}min`;
  }
}
