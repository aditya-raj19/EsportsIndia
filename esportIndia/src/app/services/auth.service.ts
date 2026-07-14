import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router=inject(Router)

  isLoggedIn = signal<boolean>(false); // cannot check cookie directly (httpOnly hides it from JS)

  login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(tap(() => this.isLoggedIn.set(true)));
  }

  logout() {
    return this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.isLoggedIn.set(false)));
  }
  signUp(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/register`, { email, password }, { withCredentials: true })
      .pipe(tap(() => this.isLoggedIn.set(true)));
  }


  
  checkAuth() {
  return this.http
    .get<{ email: string }>(`${environment.apiUrl}/me`, { withCredentials: true })
    .pipe(
      tap((res) => {
        this.isLoggedIn.set(true);
        if(res?.email!=="anonymousUser"){
          this.router.navigate(['/homepage']);
        }
      }),
      catchError(() => {
        this.isLoggedIn.set(false);
        return of(null);   // critical — swallows the error, returns a safe fallback
      })
    );
}
}