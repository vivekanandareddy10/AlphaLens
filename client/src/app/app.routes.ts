import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { SavedReportsComponent } from './pages/saved-reports/saved-reports';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'research-report', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'saved-reports', component: SavedReportsComponent },
  { path: '**', redirectTo: '' }
];
