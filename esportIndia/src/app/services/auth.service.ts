import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, of, tap, switchMap } from 'rxjs';
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
  signUp(form: SignupPayload) {
    const { email, password , username } = form;

    return this.http
      .post(`${environment.apiUrl}/register`, { email, password, username }, { withCredentials: true })
      .pipe(switchMap(() => this.login(email, password)));
  }


  
  checkAuth() {
  return this.http
    .get<{ email: string }>(`${environment.apiUrl}/me`, { withCredentials: true })
    .pipe(
      tap((res) => {
        if(res?.email && res.email !== "anonymousUser"){
          this.isLoggedIn.set(true);
        } else {
          this.isLoggedIn.set(false);
        }
      }),
      catchError(() => {
        this.isLoggedIn.set(false);
        return of(null);   // critical — swallows the error, returns a safe fallback
      })
    );
}

}
export interface SignupPayload {
  username?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  terms?: boolean;
}
