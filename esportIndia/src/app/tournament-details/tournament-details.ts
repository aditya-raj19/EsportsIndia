import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Tournament, TournamentService, Standing } from '../services/tournament.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tournament-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournament-details.html',
  styleUrl: './tournament-details.css',
})
export class TournamentDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentService = inject(TournamentService);
  private platformId = inject(PLATFORM_ID);
  public auth = inject(AuthService);

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

  readonly tournament = signal<Tournament | null>(null);
  readonly standings = signal<Standing[]>([]);
  readonly loading = signal(true);
  readonly standingsLoading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly activeTab = signal<'overview' | 'teams' | 'matches' | 'standings'>('overview');

  readonly isDarkMode = signal(false);

  readonly completedMatches = computed(() =>
    this.tournament()?.matches?.filter(m => m.status === 'finished' || m.status === 'completed') ?? []
  );

  readonly upcomingMatches = computed(() =>
    this.tournament()?.matches?.filter(m => m.status === 'not_started' || m.status === 'upcoming') ?? []
  );

  readonly liveMatches = computed(() =>
    this.tournament()?.matches?.filter(m => m.status === 'running' || m.status === 'live') ?? []
  );

  ngOnInit() {
    this.initTheme();

    // Read tournament data passed via router state
    const nav = this.router.getCurrentNavigation();
    const stateData = nav?.extras?.state?.['tournament'] as Tournament | undefined;

    // Also check history.state for browser back/forward navigation
    const historyData = isPlatformBrowser(this.platformId)
      ? (history.state?.['tournament'] as Tournament | undefined)
      : undefined;

    const tournament = stateData || historyData;

    if (tournament) {
      this.tournament.set(tournament);
      this.loading.set(false);
      this.loadStandings(tournament.id);
    } else {
      this.errorMsg.set('Tournament data not available. Please go back and click on a tournament card.');
      this.loading.set(false);
    }
  }

  private initTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        this.isDarkMode.set(true);
        document.documentElement.classList.add('dark');
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

  private loadStandings(id: number) {
    this.standingsLoading.set(true);
    this.tournamentService.getTournamentStandings(id).subscribe({
      next: (data) => {
        this.standings.set(data);
        this.standingsLoading.set(false);
      },
      error: () => {
        this.standingsLoading.set(false);
      },
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(`${route}/`);
  }

  onSignOut() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  goBack() {
    this.router.navigate(['/tournaments']);
  }

  setTab(tab: 'overview' | 'teams' | 'matches' | 'standings') {
    this.activeTab.set(tab);
  }

  getTierColor(tier: string): string {
    const t = tier?.toLowerCase() || '';
    switch (t) {
      case 's': return 'bg-purple-500/20 text-purple-600 border-purple-500/30 dark:text-purple-400';
      case 'a': return 'bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400';
      case 'b': return 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-400';
      case 'c': return 'bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400';
      case 'd': return 'bg-gray-500/20 text-gray-600 border-gray-500/30 dark:text-gray-400';
      default: return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10';
    }
  }

  getStatusColor(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s === 'running' || s === 'live') return 'bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400';
    if (s === 'finished' || s === 'completed') return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10';
    if (s === 'not_started' || s === 'upcoming') return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400';
    return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  formatPrizePool(prize: string): string {
    if (!prize || prize.trim() === '' || prize.toLowerCase() === 'tba') return 'TBA';
    const numMatch = prize.replace(/,/g, '').match(/\d+/);
    if (!numMatch) return prize;
    const amount = parseInt(numMatch[0], 10);
    let inrAmount = amount;
    const lower = prize.toLowerCase();
    if (lower.includes('dollar') || lower.includes('usd') || lower.includes('$')) {
      inrAmount = amount * 84;
    } else if (lower.includes('euro') || lower.includes('eur') || lower.includes('€')) {
      inrAmount = amount * 92;
    } else if (lower.includes('krw') || lower.includes('won')) {
      inrAmount = amount * 0.06;
    } else if (lower.includes('yuan') || lower.includes('rmb') || lower.includes('cny')) {
      inrAmount = amount * 11.5;
    } else if (!lower.includes('inr') && !lower.includes('rupee')) {
      inrAmount = amount * 84;
    }
    if (inrAmount >= 10000000) {
      return `₹${(inrAmount / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
    } else if (inrAmount >= 100000) {
      return `₹${(inrAmount / 100000).toFixed(1).replace(/\.0$/, '')} L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(inrAmount);
  }
}
