import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Layout } from './shared/layout/layout';
import { authGuard } from './core/guards/auth-guard';
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

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'no-store', component: NoStore },

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      // Admin routes
      { path: 'admin', component: Admin },
      { path: 'admin/users', component: Users },
      { path: 'admin/data-monitoring', component: DataMonitoring },
      { path: 'admin/ml-monitoring', component: MlMonitoring },
      { path: 'admin/settings', component: Settings },
      { path: 'admin/stores', component: Stores },
      { path: 'admin/families', component: Families },
      { path: 'admin/predictions', component: Predictions },
      { path: 'admin/alerts', component: Alerts },
      { path: 'admin/custom-analysis', component: CustomAnalysis },

      // Manager routes
      { path: 'manager', component: Manager },
      { path: 'manager/stores', component: Stores },
      { path: 'manager/families', component: Families },
      { path: 'manager/predictions', component: Predictions },
      { path: 'manager/alerts', component: Alerts },
      { path: 'manager/custom-analysis', component: CustomAnalysis },

      // Responsable Magasin routes
      { path: 'responsable-magasin', component: ResponsableMagasin, canActivate: [storeGuard] },
      { path: 'responsable-magasin/stock', component: Stock, canActivate: [storeGuard] },
      { path: 'responsable-magasin/at-risk', component: AtRisk, canActivate: [storeGuard] },
      { path: 'responsable-magasin/dormant', component: Dormant, canActivate: [storeGuard] },

      // Data Analyst routes
      { path: 'data-analyst', component: DataAnalyst },
      { path: 'data-analyst/data-quality', component: DataQuality },
      { path: 'data-analyst/ml-evolution', component: MlEvolution },
      { path: 'data-analyst/staging-viewer', component: StagingViewer },
      { path: 'data-analyst/staging-review', component: StagingReview },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
