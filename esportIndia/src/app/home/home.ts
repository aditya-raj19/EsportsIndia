import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private http = inject(HttpClient);
 
  loading = signal(false);
  signedOut = signal(false);
  errorMsg = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  onSignOut() {


    this.auth.logout().subscribe({
      next: () => {
        this.loading.set(false);
        this.signedOut.set(true);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.message ?? 'Something went wrong while signing out. Please try again.');
      },
    });
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }
}
