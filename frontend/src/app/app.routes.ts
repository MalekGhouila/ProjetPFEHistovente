import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Admin } from './dashboards/admin/admin';
import { Manager } from './dashboards/manager/manager';
import { ResponsableMagasin } from './dashboards/responsable-magasin/responsable-magasin';
import { DataAnalyst } from './dashboards/data-analyst/data-analyst';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin },
  { path: 'manager', component: Manager },
  { path: 'responsable-magasin', component: ResponsableMagasin },
  { path: 'data-analyst', component: DataAnalyst },
  { path: '**', redirectTo: 'login' }
];
