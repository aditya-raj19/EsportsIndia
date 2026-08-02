import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  public auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isDarkMode = signal<boolean>(false);

  readonly menus = [
    { label: 'Home', route: '/homepage' },
    { label: 'Live', route: '/live' },
    { label: 'Upcoming', route: '/upcoming' },
    { label: 'Results', route: '/results' },
    { label: 'News', route: '/news' },
    { label: 'Tournaments', route: '/tournaments' },
    { label: 'Teams', route: '/teams' },
    { label: 'Rankings', route: '/rankings' },
  ];

  ngOnInit() {
    this.initTheme();
  }

  private initTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        this.isDarkMode.set(true);
        document.documentElement.classList.add('dark');
      } else {
        this.isDarkMode.set(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  hasSubheader(): boolean {
    const url = this.router.url;
    return url.startsWith('/live') || 
           url.startsWith('/upcoming') || 
           url.startsWith('/results') || 
           url.startsWith('/tournaments') || 
           url.startsWith('/teams') || 
           url.startsWith('/rankings') || 
           url.startsWith('/news');
  }

  onSignOut() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
