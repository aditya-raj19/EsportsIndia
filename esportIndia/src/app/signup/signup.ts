import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  showPassword = signal(false);

  features = [
    { title: 'Live tournaments', desc: 'Join competitions across 10+ games', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { title: 'Real cash prizes', desc: 'Compete for ₹2.4Cr+ in prize pools', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 2v8m0 0v2m0-2c-1.11 0-2.08-.402-2.599-1' },
    { title: 'Verified rankings', desc: 'Track your stats and climb the leaderboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router,private authService: AuthService) {
    this.signupForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator }
    );
  }

  get username() { return this.signupForm.get('username')!; }
  get email() { return this.signupForm.get('email')!; }
  get password() { return this.signupForm.get('password')!; }
  get confirmPassword() { return this.signupForm.get('confirmPassword')!; }
  get terms() { return this.signupForm.get('terms')!; }

  passwordStrength = computed(() => {
    const val: string = this.password.value || '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  });

  strengthLabel(): string {
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return labels[Math.max(0, this.passwordStrength() - 1)] ?? 'Weak';
  }

  strengthColor(): string {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[Math.max(0, this.passwordStrength() - 1)] ?? 'bg-red-500';
  }

  strengthTextColor(): string {
    const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'];
    return colors[Math.max(0, this.passwordStrength() - 1)] ?? 'text-red-400';
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onGoogleSignup() {
    // OAuth flow
  }

  onDiscordSignup() {
    // OAuth flow
  }

  onSubmit() {
    this.errorMsg.set(null);
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.signUp(this.signupForm.value).subscribe({
    next: () => {
      this.loading.set(false);
      this.router.navigate(['/homepage']);
    },
    error: (err) => {
      this.loading.set(false);
      if (err.status === 409) {
        this.errorMsg.set('An account with this email already exists.');
      } else {
        this.errorMsg.set(err.error?.message ?? 'Something went wrong. Please try again.');
      }
    },
  });
  }
}