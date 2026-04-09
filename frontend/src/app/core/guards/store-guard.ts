import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const storeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();
  const storeId = authService.getIdMagasin();

  if (role === 'RESPONSABLE_MAGASIN' && !storeId) {
    router.navigate(['/no-store']);
    return false;
  }

  return true;
};
