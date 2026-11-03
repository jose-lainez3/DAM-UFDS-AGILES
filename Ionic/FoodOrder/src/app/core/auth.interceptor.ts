import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Añade el token Bearer (si hay sesión) y, si el servidor responde 401 con un token caducado, cierra la sesión local. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token;
  const peticion = token && !req.headers.has('Authorization')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      const esAuth = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (error.status === 401 && !esAuth && auth.isLoggedIn()) {
        auth.limpiar();
        router.navigate(['/login'], { replaceUrl: true, queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
