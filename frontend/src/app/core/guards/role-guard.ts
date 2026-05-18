import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.getRole();

    if (role && allowedRoles.includes(role)) return true;

    if (role === 'ADMIN') {
      // Build the full target URL from the route snapshot tree
      const segments: string[] = [];
      let r: ActivatedRouteSnapshot | null = route;
      while (r) {
        r.url.forEach(seg => segments.push(seg.path));
        r = r.firstChild;
      }
      const fullPath = '/' + segments.join('/'); // e.g. "/manager/custom-analysis"

      const adminUrl = fullPath
        .replace(/^\/manager/, '/admin')
        .replace(/^\/responsable-magasin/, '/admin')
        .replace(/^\/data-analyst/, '/admin');

      router.navigate([adminUrl]);
      return false;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
}
