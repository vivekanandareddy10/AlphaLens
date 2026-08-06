import { Component, Input, AfterViewInit, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-annual-trends-chart',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%; height: 260px;">
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class AnnualTrendsChartComponent implements AfterViewInit, OnChanges {
  @Input() annualTrends: Array<{ year: string; revenue: number; profit: number }> = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['annualTrends'] && !changes['annualTrends'].firstChange) {
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

    const labels = this.annualTrends.map(t => t.year);
    const revenues = this.annualTrends.map(t => t.revenue);
    const profits = this.annualTrends.map(t => t.profit);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenues,
            backgroundColor: '#8b5cf6',
            borderRadius: 4,
            borderSkipped: false
          },
          {
            label: 'Net Profit',
            data: profits,
            backgroundColor: '#10b981',
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#a3a3a3',
              font: { size: 10 }
            }
          },
          tooltip: {
            backgroundColor: '#171717',
            borderColor: '#262626',
            borderWidth: 1,
            titleColor: '#a3a3a3',
            bodyColor: '#e5e5e5',
            padding: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = Number(context.raw);
                return ` ${label}: $${val.toLocaleString('en-US')}`;
              }
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
              callback: (val) => {
                const num = Number(val);
                if (Math.abs(num) >= 1e9) {
                  return `$${(num / 1e9).toFixed(1)}B`;
                }
                if (Math.abs(num) >= 1e6) {
                  return `$${(num / 1e6).toFixed(1)}M`;
                }
                return `$${num.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      const labels = this.annualTrends.map(t => t.year);
      const revenues = this.annualTrends.map(t => t.revenue);
      const profits = this.annualTrends.map(t => t.profit);
      
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = revenues;
      this.chart.data.datasets[1].data = profits;
      this.chart.update();
    } else {
      this.createChart();
    }
  }
}
