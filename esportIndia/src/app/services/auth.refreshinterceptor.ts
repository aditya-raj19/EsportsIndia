import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/refresh') && !req.url.includes('/login')) {
        return http.post(
          `${environment.apiUrl}/refresh`,
          {},
          { withCredentials: true }
        ).pipe(
          switchMap(() => next(req)),
          catchError((refreshErr) => throwError(() => refreshErr))
        );
      }
      return throwError(() => err);
    })
  );
};