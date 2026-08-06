import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  id: string;
  label: string;
  desc: string;
  color: string;
  ring: string;
  icon: string;
}

@Component({
  selector: 'app-agent-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-progress.html',
  styleUrl: './agent-progress.css'
})
export class AgentProgressComponent implements OnInit, OnDestroy {
  @Input() companyName: string = '';
  protected readonly Math = Math;

  steps: Step[] = [
    { id: 'research', label: 'Research Agent', desc: 'Finding ticker & profile details...', icon: 'search', color: 'text-blue-400', ring: 'shadow-blue-500/40' },
    { id: 'finance', label: 'Financial Data Agent', desc: 'Fetching financial metrics & price history...', icon: 'percent', color: 'text-emerald-400', ring: 'shadow-emerald-500/40' },
    { id: 'news', label: 'News Analysis Agent', desc: 'Scouring Tavily & summarizing sentiment...', icon: 'newspaper', color: 'text-amber-400', ring: 'shadow-amber-500/40' },
    { id: 'risk', label: 'Risk Analysis Agent', desc: 'Evaluating regulatory & industry bottlenecks...', icon: 'shield-alert', color: 'text-rose-400', ring: 'shadow-rose-500/40' },
    { id: 'decision', label: 'Decision Agent', desc: 'Synthesizing report & final rating...', icon: 'check-square', color: 'text-violet-400', ring: 'shadow-violet-500/40' },
  ];

  currentStep = 0;
  subProgress = 0;
  overallProgress = 0;
  private intervalId: any;

  private stepDurationMs = 4500;
  private tickMs = 70;
  private tickIncrement = (this.tickMs / this.stepDurationMs) * 100;
  private finalStepHoldPct = 92;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      const isLastStep = this.currentStep === this.steps.length - 1;

      if (isLastStep) {
        this.subProgress = Math.min(this.subProgress + this.tickIncrement, this.finalStepHoldPct);
      } else if (this.subProgress >= 100) {
        this.currentStep = Math.min(this.currentStep + 1, this.steps.length - 1);
        this.subProgress = 0;
      } else {
        this.subProgress += this.tickIncrement;
      }

      this.overallProgress = Math.min(
        100,
        Math.round(((this.currentStep + this.subProgress / 100) / this.steps.length) * 100)
      );
    }, this.tickMs);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  isCompleted(idx: number): boolean {
    return idx < this.currentStep;
  }

  isActive(idx: number): boolean {
    return idx === this.currentStep;
  }

  getLocalPct(idx: number): number {
    return this.isActive(idx) ? this.subProgress : this.isCompleted(idx) ? 100 : 0;
  }
}
