import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  query = '';
  history: any[] = [];
  reports: any[] = [];
  searchFocused = false;
  hoveredReportId: string | null = null;
  defaultSuggestions = ['Apple', 'Tesla', 'Nvidia', 'Microsoft', 'Amazon'];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.fetchInitialData();
  }

  fetchInitialData() {
    this.apiService.getHistory().subscribe({
      next: (histData) => this.history = histData,
      error: (err) => console.error('Failed to load search history:', err)
    });

    this.apiService.getReports().subscribe({
      next: (repData) => this.reports = repData,
      error: (err) => console.error('Failed to load saved reports:', err)
    });
  }

  handleSearch(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    if (!this.query.trim()) return;
    this.router.navigate(['/research-report'], { queryParams: { search: this.query } });
  }

  handleSelectHistory(name: string) {
    this.router.navigate(['/research-report'], { queryParams: { search: name } });
  }

  handleSelectReport(id: string) {
    this.router.navigate(['/research-report'], { queryParams: { reportId: id } });
  }

  handleDeleteReport(event: Event, id: string) {
    event.stopPropagation();
    this.apiService.deleteReport(id).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r._id !== id);
      },
      error: (err) => console.error('Failed to delete report:', err)
    });
  }

  onFocus() {
    this.searchFocused = true;
  }

  onBlur() {
    setTimeout(() => {
      this.searchFocused = false;
    }, 150);
  }

  getFilteredSuggestions(): string[] {
    const pool = this.history.length
      ? this.history.map(h => h.companyName)
      : this.defaultSuggestions;
    
    const uniquePool = Array.from(new Set(pool));

    if (!this.query) {
      return uniquePool.slice(0, 5);
    }
    return uniquePool
      .filter(name => name.toLowerCase().includes(this.query.toLowerCase()))
      .slice(0, 5);
  }

  selectSuggestion(name: string) {
    this.query = name;
    this.handleSearch();
  }

  getYear(): number {
    return new Date().getFullYear();
  }
}
