import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Layout } from './shared/layout/layout';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { storeGuard } from './core/guards/store-guard';
import { NoStore } from './shared/no-store/no-store';

// Dashboards
import { Admin } from './dashboards/admin/admin';
import { Manager } from './dashboards/manager/manager';
import { ResponsableMagasin } from './dashboards/responsable-magasin/responsable-magasin';
import { DataAnalyst } from './dashboards/data-analyst/data-analyst';

// Manager sub-pages
import { Stores } from './dashboards/manager/stores/stores';
import { Families } from './dashboards/manager/families/families';
import { Predictions } from './dashboards/manager/predictions/predictions';
import { Alerts } from './dashboards/manager/alerts/alerts';
import { CustomAnalysis } from './dashboards/manager/custom-analysis/custom-analysis';

// Responsable sub-pages
import { Stock } from './dashboards/responsable-magasin/stock/stock';
import { AtRisk } from './dashboards/responsable-magasin/at-risk/at-risk';
import { Dormant } from './dashboards/responsable-magasin/dormant/dormant';

// Data Analyst sub-pages
import { DataQuality } from './dashboards/data-analyst/data-quality/data-quality';
import { MlEvolution } from './dashboards/data-analyst/ml-evolution/ml-evolution';
import { StagingViewer } from './dashboards/data-analyst/staging-viewer/staging-viewer';
import { StagingReview } from './dashboards/data-analyst/staging-review/staging-review';

// Admin sub-pages
import { Users } from './dashboards/admin/users/users';
import { DataMonitoring } from './dashboards/admin/data-monitoring/data-monitoring';
import { MlMonitoring } from './dashboards/admin/ml-monitoring/ml-monitoring';
import { Settings } from './dashboards/admin/settings/settings';

import { Unauthorized } from './shared/unauthorized/unauthorized';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'no-store', component: NoStore },
  { path: 'unauthorized', component: Unauthorized },

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [

      // ── ADMIN ──────────────────────────────────────────
      {
        path: 'admin',
        canActivateChild: [roleGuard('ADMIN')],
        children: [
          { path: '', component: Admin },
          { path: 'users', component: Users },
          { path: 'data-monitoring', component: DataMonitoring },
          { path: 'ml-monitoring', component: MlMonitoring },
          { path: 'settings', component: Settings },
          { path: 'stores', component: Stores },
          { path: 'families', component: Families },
          { path: 'predictions', component: Predictions },
          { path: 'alerts', component: Alerts },
          { path: 'custom-analysis', component: CustomAnalysis },
          { path: 'data-quality', component: DataQuality },
        ]
      },

      // ── MANAGER ────────────────────────────────────────
      {
        path: 'manager',
        canActivateChild: [roleGuard('MANAGER', 'ADMIN')],
        children: [
          { path: '', component: Manager },
          { path: 'stores', component: Stores },
          { path: 'families', component: Families },
          { path: 'predictions', component: Predictions },
          { path: 'alerts', component: Alerts },
          { path: 'custom-analysis', component: CustomAnalysis },
        ]
      },

      // ── RESPONSABLE MAGASIN ────────────────────────────
      {
        path: 'responsable-magasin',
        canActivateChild: [roleGuard('RESPONSABLE_MAGASIN', 'ADMIN')],
        children: [
          { path: '', component: ResponsableMagasin, canActivate: [storeGuard] },
          { path: 'stock', component: Stock, canActivate: [storeGuard] },
          { path: 'at-risk', component: AtRisk, canActivate: [storeGuard] },
          { path: 'dormant', component: Dormant, canActivate: [storeGuard] },
        ]
      },

      // ── DATA ANALYST ───────────────────────────────────
      {
        path: 'data-analyst',
        canActivateChild: [roleGuard('DATA_ANALYST', 'ADMIN')],
        children: [
          { path: '', component: DataAnalyst },
          { path: 'data-quality', component: DataQuality },
          { path: 'ml-evolution', component: MlEvolution },
          { path: 'staging-viewer', component: StagingViewer },
          { path: 'staging-review', component: StagingReview },
        ]
      },

    ]
  },

  { path: '**', redirectTo: 'unauthorized' }
];
