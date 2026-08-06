import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  research(companyName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/research`, { companyName });
  }

  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`);
  }

  getReport(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/${id}`);
  }

  deleteReport(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/reports/${id}`);
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  askChatFollowUp(id: string, message: string, chatHistory: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reports/${id}/chat`, { message, chatHistory });
  }
}
