import { Component, Input, AfterViewInit, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-history-chart',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%; height: 260px;">
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class HistoryChartComponent implements AfterViewInit, OnChanges {
  @Input() historyData: Array<{ date: string; close: number }> = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['historyData'] && !changes['historyData'].firstChange) {
      this.updateChart();
    }
  }

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    if (!this.chartCanvas) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.historyData.map(h => h.date);
    const data = this.historyData.map(h => h.close);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Close',
          data,
          borderColor: '#a78bfa',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#a78bfa',
          backgroundColor: gradient,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#171717',
            borderColor: '#262626',
            borderWidth: 1,
            titleColor: '#a3a3a3',
            bodyColor: '#e5e5e5',
            padding: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `$${Number(context.raw).toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#525252', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(38, 38, 38, 0.5)' },
            ticks: {
              color: '#525252',
              font: { size: 10 },
              callback: (val) => `$${val}`
            }
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      const labels = this.historyData.map(h => h.date);
      const data = this.historyData.map(h => h.close);
      
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    } else {
      this.createChart();
    }
  }
}
