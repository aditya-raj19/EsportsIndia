import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User, UserService } from '../services/user';
import { environment } from '../../environment/environment';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  private userService = inject(UserService);

  users = signal<User[]>([]);

  ngOnInit() {
  }

  // ── State signals ──────────────────────────────────────────────
  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  // ── Live matches ticker ────────────────────────────────────────
  liveMatches = signal([
    { game: 'Valorant — VCT India', team1: 'Global Esports', team2: 'Team Vitality', score1: 13, score2: 11, leading: 'team1' },
    { game: 'BGMI — Pro League S4', team1: 'Soul Esports',   team2: 'OR Esports',   score1: 3,  score2: 4,  leading: 'team2' },
  ]);

  // ── Form ───────────────────────────────────────────────────────
  loginForm = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    remember: new FormControl(false),
  });

  get email()    { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  // ── Actions ────────────────────────────────────────────────────
  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onGoogleLogin() {
    window.location.href = '/oauth2/authorization/google';
  }

  onDiscordLogin() {
    window.location.href = '/oauth2/authorization/discord';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const payload = {
      email:    this.email.value,
      password: this.password.value,
    };

    this.authService.login(payload.email, payload.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/homepage']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set('Login failed. Please check your credentials.');
        console.error('Login error:', err);
      }
    });


  }
}