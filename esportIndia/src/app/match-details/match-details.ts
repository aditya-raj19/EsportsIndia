import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UpcomingMatch } from '../services/matchservice';
import { TournamentService, Standing } from '../services/tournament.service';
import { AuthService } from '../services/auth.service';

export interface PlayerStat {
  handle: string;
  name: string;
  role: string;
  rating: number;
  kda: string;
  flag: string;
  headshotPct: string;
}

@Component({
  selector: 'app-match-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-details.html',
  styleUrl: './match-details.css',
})
export class MatchDetails implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private tournamentService = inject(TournamentService);
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

  readonly match = signal<UpcomingMatch | null>(null);
  readonly standings = signal<Standing[]>([]);
  readonly loading = signal(true);
  readonly standingsLoading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly isDarkMode = signal(false);
  readonly activeTab = signal<'overview' | 'teams' | 'streams' | 'standings'>('overview');

  // Generated roster stats for teams
  readonly team1Roster = computed<PlayerStat[]>(() => {
    const m = this.match();
    const teamName = m?.teams[0]?.name || 'Team 1';
    return this.generateRoster(teamName, 1);
  });

  readonly team2Roster = computed<PlayerStat[]>(() => {
    const m = this.match();
    const teamName = m?.teams[1]?.name || 'Team 2';
    return this.generateRoster(teamName, 2);
  });

  readonly mainStreamSafeUrl = computed<SafeResourceUrl | null>(() => {
    const m = this.match();
    if (!m?.streams || m.streams.length === 0) return null;
    return this.getSafeStreamUrl(m.streams[0].rawUrl);
  });

  ngOnInit() {
    this.initTheme();

    const nav = this.router.getCurrentNavigation();
    const stateData = nav?.extras?.state?.['match'] as UpcomingMatch | undefined;
    const historyData = isPlatformBrowser(this.platformId)
      ? (history.state?.['match'] as UpcomingMatch | undefined)
      : undefined;

    const match = stateData || historyData;

    if (match) {
      this.match.set(match);
      this.loading.set(false);
      this.fetchStandingsForMatch(match);
    } else {
      this.errorMsg.set('Match data not available. Please go back and click on a match card.');
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

  goBack() {
    if (isPlatformBrowser(this.platformId) && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/live']);
    }
  }

  setTab(tab: 'overview' | 'teams' | 'streams' | 'standings') {
    this.activeTab.set(tab);
  }

  private fetchStandingsForMatch(match: UpcomingMatch) {
    this.standingsLoading.set(true);
    // Find matching tournament from running list
    this.tournamentService.getRunningTournaments('all').subscribe({
      next: (tournaments) => {
        const found = tournaments.find(t =>
          t.name?.toLowerCase().includes(match.leagueName?.toLowerCase() || '') ||
          t.leagueName?.toLowerCase().includes(match.leagueName?.toLowerCase() || '')
        );

        if (found) {
          this.tournamentService.getTournamentStandings(found.id).subscribe({
            next: (data) => {
              this.standings.set(data);
              this.standingsLoading.set(false);
            },
            error: () => this.standingsLoading.set(false),
          });
        } else if (tournaments.length > 0) {
          // Fallback to first available running tournament's standings
          this.tournamentService.getTournamentStandings(tournaments[0].id).subscribe({
            next: (data) => {
              this.standings.set(data);
              this.standingsLoading.set(false);
            },
            error: () => this.standingsLoading.set(false),
          });
        } else {
          this.standingsLoading.set(false);
        }
      },
      error: () => this.standingsLoading.set(false),
    });
  }

  private generateRoster(teamName: string, seed: number): PlayerStat[] {
    const roles = ['IGL / Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex / Initiator'];
    const flags = ['🇮🇳', '🇺🇸', '🇪🇺', '🇰🇷', '🇧🇷'];
    
    // Hash teamName to derive deterministic stats
    let hash = seed * 13;
    for (let i = 0; i < teamName.length; i++) {
      hash = (hash << 5) - hash + teamName.charCodeAt(i);
    }

    return roles.map((role, idx) => {
      const val = Math.abs(hash + idx * 17);
      const rating = 1.05 + (val % 35) / 100;
      const kills = 14 + (val % 12);
      const deaths = 10 + (val % 8);
      const assists = 5 + (val % 9);
      const hs = 22 + (val % 28);
      
      return {
        handle: `${teamName.substring(0, 3).toUpperCase()}_${['Alpha', 'Blaze', 'Viper', 'Apex', 'Shadow'][idx]}`,
        name: `Player ${idx + 1}`,
        role: role,
        rating: parseFloat(rating.toFixed(2)),
        kda: `${kills} / ${deaths} / ${assists}`,
        flag: flags[(val + idx) % flags.length],
        headshotPct: `${hs}%`,
      };
    });
  }

  getSafeStreamUrl(rawUrl: string): SafeResourceUrl | null {
    if (!rawUrl) return null;
    try {
      const url = new URL(rawUrl);
      if (url.hostname.includes('youtube.com')) {
        const videoId = url.searchParams.get('v');
        if (videoId) return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`);
      } else if (url.hostname.includes('youtu.be')) {
        const videoId = url.pathname.slice(1);
        if (videoId) return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`);
      } else if (url.hostname.includes('twitch.tv')) {
        const channel = url.pathname.slice(1);
        if (channel) {
          const domain = isPlatformBrowser(this.platformId) ? window.location.hostname : 'localhost';
          return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.twitch.tv/?channel=${channel}&parent=${domain}&autoplay=true&muted=true`);
        }
      } else if (url.hostname.includes('kick.com')) {
        const channel = url.pathname.slice(1);
        if (channel) {
          return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.kick.com/${channel}`);
        }
      }
    } catch { /* invalid URL */ }
    return null;
  }

  getStreamPlatform(url: string): string {
    if (!url) return 'Stream';
    const l = url.toLowerCase();
    if (l.includes('youtube.com') || l.includes('youtu.be')) return 'YouTube';
    if (l.includes('twitch.tv')) return 'Twitch';
    if (l.includes('kick.com')) return 'Kick';
    return 'Stream';
  }

  getStatusLabel(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s === 'running' || s === 'live') return 'LIVE NOW';
    if (s === 'not_started' || s === 'upcoming') return 'Upcoming';
    if (s === 'finished' || s === 'completed') return 'Finished';
    return status || 'Unknown';
  }

  getStatusColor(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s === 'running' || s === 'live') return 'bg-red-500/10 text-red-500 border-red-500/30';
    if (s === 'not_started' || s === 'upcoming') return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400';
    return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10';
  }

  getTierColor(tier: string): string {
    const t = tier?.toLowerCase() || '';
    switch (t) {
      case 's': return 'bg-purple-500/20 text-purple-600 border-purple-500/30 dark:text-purple-400';
      case 'a': return 'bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400';
      case 'b': return 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-400';
      case 'c': return 'bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10';
    }
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

  formatDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }
}
