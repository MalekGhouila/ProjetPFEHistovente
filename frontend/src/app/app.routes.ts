import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Admin } from './dashboards/admin/admin';
import { Manager } from './dashboards/manager/manager';
import { ResponsableMagasin } from './dashboards/responsable-magasin/responsable-magasin';
import { DataAnalyst } from './dashboards/data-analyst/data-analyst';
import {authGuard} from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: 'manager', component: Manager, canActivate: [authGuard] },
  { path: 'responsable-magasin', component: ResponsableMagasin, canActivate: [authGuard] },
  { path: 'data-analyst', component: DataAnalyst, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
