import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. Get token from localStorage
  const token = localStorage.getItem('token');

  // 2. If token exists, add it to request
  const authReq = token
    ? req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    })
    : req;

  // 3. Send request and handle errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 4. If 401 (unauthorized/expired) → redirect to login
      if (error.status === 401) {
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
