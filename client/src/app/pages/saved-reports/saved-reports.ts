import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-saved-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-reports.html',
  styleUrl: './saved-reports.css'
})
export class SavedReportsComponent implements OnInit {
  savedReports: any[] = [];
  searchHistory: any[] = [];
  loading = true;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getReports().subscribe({
      next: (reports) => {
        this.savedReports = reports;
        this.apiService.getHistory().subscribe({
          next: (history) => {
            this.searchHistory = history;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load history:', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load saved reports:', err);
        this.loading = false;
      }
    });
  }

  handleDeleteReport(id: string) {
    this.apiService.deleteReport(id).subscribe({
      next: () => {
        this.savedReports = this.savedReports.filter(r => r._id !== id);
      },
      error: (err) => console.error('Failed to delete report:', err)
    });
  }

  navigateToDashboard(reportId?: string, searchName?: string) {
    if (reportId) {
      this.router.navigate(['/research-report'], { queryParams: { reportId } });
    } else if (searchName) {
      this.router.navigate(['/research-report'], { queryParams: { search: searchName } });
    } else {
      this.router.navigate(['/research-report']);
    }
  }
}
