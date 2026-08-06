import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AgentProgressComponent } from '../../components/agent-progress/agent-progress';
import { HistoryChartComponent } from '../../components/history-chart/history-chart';
import { AnnualTrendsChartComponent } from '../../components/annual-trends-chart/annual-trends-chart';
import { Subscription } from 'rxjs';

type TabType = 'report' | 'compare' | 'saved';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AgentProgressComponent,
    HistoryChartComponent,
    AnnualTrendsChartComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewChecked {
  activeTab: TabType = 'report';
  loading = true;
  error: { agent: string; reason: string } | null = null;
  report: any = null;

  copied = false;
  shared = false;
  saved = false;

  savedReports: any[] = [];
  searchHistory: any[] = [];

  compareCompanyQuery = '';
  compareReport: any = null;
  compareLoading = false;
  compareError: string | null = null;

  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  chatInput = '';
  chatLoading = false;
  
  searchName: string | null = null;
  reportId: string | null = null;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  private queryParamsSub!: Subscription;
  private shouldScrollChat = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      this.searchName = params['search'] || null;
      this.reportId = params['reportId'] || null;

      this.fetchSavedAndHistory();

      if (this.searchName) {
        this.triggerResearch(this.searchName);
      } else if (this.reportId) {
        this.loadReport(this.reportId);
      } else {
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollChat) {
      this.scrollToBottom();
      this.shouldScrollChat = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  fetchSavedAndHistory() {
    this.apiService.getHistory().subscribe({
      next: (history) => this.searchHistory = history,
      error: (err) => console.error('Failed to load history:', err)
    });

    this.apiService.getReports().subscribe({
      next: (reports) => this.savedReports = reports,
      error: (err) => console.error('Failed to load saved reports:', err)
    });
  }

  triggerResearch(name: string) {
    this.loading = true;
    this.error = null;
    this.apiService.research(name).subscribe({
      next: (data) => {
        if (data.failedNodes && data.failedNodes['Decision Agent']) {
          this.error = {
            agent: 'Decision Agent',
            reason: data.failedNodes['Decision Agent'] || 'Critical pipeline execution error.'
          };
          this.loading = false;
          return;
        }

        this.report = data;
        this.chatMessages = [
          {
            role: 'assistant',
            content: `Hello! I have generated the investment report for **${data.companyName}**. Ask me follow-up questions about its financial metrics, news sentiment, risk factors, or long-term outlook.`
          }
        ];
        this.shouldScrollChat = true;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = {
          agent: 'LangGraph Orchestrator',
          reason: err.error?.error || err.message || 'Workflow crashed during execution.'
        };
        this.loading = false;
      }
    });
  }

  loadReport(id: string) {
    this.loading = true;
    this.error = null;
    this.apiService.getReport(id).subscribe({
      next: (data) => {
        this.report = data;
        this.chatMessages = [
          {
            role: 'assistant',
            content: `Loaded report for **${data.companyName}**. Ask me follow-up questions based on this historical analysis.`
          }
        ];
        this.shouldScrollChat = true;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = {
          agent: 'Database Connector',
          reason: err.error?.error || 'Failed to retrieve saved report.'
        };
        this.loading = false;
      }
    });
  }

  handleDeleteReport(id: string) {
    this.apiService.deleteReport(id).subscribe({
      next: () => {
        this.savedReports = this.savedReports.filter(r => r._id !== id);
        if (this.report && this.report._id === id) {
          this.report = null;
        }
      },
      error: (err) => console.error('Failed to delete report:', err)
    });
  }

  handleCompareSearch(event: Event) {
    event.preventDefault();
    if (!this.compareCompanyQuery.trim()) return;

    this.compareLoading = true;
    this.compareError = null;
    this.apiService.research(this.compareCompanyQuery).subscribe({
      next: (data) => {
        this.compareReport = data;
        this.compareLoading = false;
      },
      error: (err) => {
        this.compareError = err.error?.error || 'Could not fetch data for the comparison company.';
        this.compareLoading = false;
      }
    });
  }

  handleChatSubmit(event: Event) {
    event.preventDefault();
    if (!this.chatInput.trim() || this.chatLoading || !this.report) return;

    const userMessage = this.chatInput;
    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatInput = '';
    this.chatLoading = true;
    this.shouldScrollChat = true;

    this.apiService.askChatFollowUp(this.report._id, userMessage, this.chatMessages.slice(1)).subscribe({
      next: (response) => {
        this.chatMessages.push({ role: 'assistant', content: response.reply });
        this.chatLoading = false;
        this.shouldScrollChat = true;
      },
      error: (err) => {
        console.error(err);
        this.chatMessages.push({
          role: 'assistant',
          content: "Sorry, I couldn't reach the AI model. Please verify your server is running with GROQ_API_KEY."
        });
        this.chatLoading = false;
        this.shouldScrollChat = true;
      }
    });
  }

  handleCopy() {
    if (!this.report) return;
    const textToCopy = `
INVESTMENT REPORT: ${this.report.companyName} (${this.report.ticker || 'N/A'})
Recommendation: ${this.report.recommendation?.action} (Confidence: ${this.report.recommendation?.confidence}%)
Summary: ${this.report.recommendation?.summary}
Long-Term Outlook: ${this.report.recommendation?.longTermOutlook}
    `;
    navigator.clipboard.writeText(textToCopy.trim());
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  handleShare() {
    if (!this.report) return;
    const shareUrl = `${window.location.origin}/dashboard?reportId=${this.report._id}`;
    navigator.clipboard.writeText(shareUrl);
    this.shared = true;
    setTimeout(() => this.shared = false, 2000);
  }

  handlePrint() {
    window.print();
  }

  handleDownload() {
    if (!this.report) return;

    const lines = [
      `INVESTMENT REPORT: ${this.report.companyName} (${this.report.ticker || 'N/A'})`,
      `Generated: ${new Date().toLocaleString()}`,
      '=' .repeat(60),
      '',
      `RECOMMENDATION: ${this.report.recommendation?.action} (Confidence: ${this.report.recommendation?.confidence}%)`,
      '',
      'SUMMARY',
      this.report.recommendation?.summary || 'N/A',
      '',
      'LONG-TERM OUTLOOK',
      this.report.recommendation?.longTermOutlook || 'N/A',
      '',
      'COMPANY PROFILE',
      this.report.profile?.description || 'N/A',
      '',
      'NEWS SENTIMENT SUMMARY',
      this.report.newsSummary?.summary || 'N/A',
      '',
      '=' .repeat(60),
      'Generated by AlphaLens — LangGraph.js + Groq multi-agent research pipeline',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(this.report.companyName || 'report').replace(/\s+/g, '_')}_AlphaLens_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  handleSaveReport() {
    if (!this.report) return;
    this.apiService.research(this.report.companyName).subscribe({
      next: (response) => {
        this.report = response;
        this.saved = true;
        setTimeout(() => this.saved = false, 2000);
        this.fetchSavedAndHistory();
      },
      error: (err) => console.error('Failed to save report:', err)
    });
  }

  setSearchParams(params: { [key: string]: any }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  getRiskSeverity(title: string, text: string) {
    const combinedText = (title + ' ' + text).toLowerCase();
    if (combinedText.includes('high') || combinedText.includes('critical') || combinedText.includes('severe') || combinedText.includes('threat')) {
      return { label: 'High', style: 'border-l-rose-500 text-rose-400 bg-rose-500/5', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/25' };
    }
    if (combinedText.includes('moderate') || combinedText.includes('medium') || combinedText.includes('volatile') || combinedText.includes('regulatory')) {
      return { label: 'Moderate', style: 'border-l-amber-500 text-amber-400 bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25' };
    }
    return { label: 'Low', style: 'border-l-emerald-500 text-emerald-400 bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' };
  }

  hasFailedNodes(): boolean {
    return this.report && this.report.failedNodes && Object.keys(this.report.failedNodes).length > 0;
  }

  getFailedNodesList(): Array<{ node: string; error: string }> {
    if (!this.report || !this.report.failedNodes) return [];
    return Object.entries(this.report.failedNodes).map(([node, error]) => ({ node, error: String(error) }));
  }

  navigateHome() {
    this.router.navigate(['/']);
  }

  handleCompareCompany() {
    this.activeTab = 'compare';
  }

  handleOpenSavedReports() {
    this.router.navigate(['/saved-reports']);
  }

  getYear(): number {
    return new Date().getFullYear();
  }
}
