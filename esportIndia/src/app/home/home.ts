import { Component, signal, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Valorant } from '../valorant/valorant';
import { LiveMatches } from '../live-matches/live-matches';
import { PastMatches } from '../past-matches/past-matches';
import { Tournaments } from '../tournaments/tournaments';
import { Rankings } from '../rankings/rankings';
import { News } from '../news/news';
import { GameSlug, MatchService, UpcomingMatch } from '../services/matchservice';
import { GameSection, GameSectionType } from '../game-section/game-section';
import { TournamentService } from '../services/tournament.service';
import { GameTabs, Game } from '../shared/game-tabs/game-tabs';

@Component({
  selector: 'app-home',
  imports: [Valorant, LiveMatches, PastMatches, Tournaments, Rankings, GameSection, News, GameTabs],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private matchService = inject(MatchService);
  private tournamentService = inject(TournamentService);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  loading = signal(false);
  signedOut = signal(false);
  errorMsg = signal<string | null>(null);

  liveMatchesCount = signal<number>(0);
  upcomingMatchesCount = signal<number>(0);
  tournamentsCount = signal<number>(0);

  isDarkMode = signal<boolean>(false);

  sliderLiveMatches = signal<UpcomingMatch[]>([]);
  isLoadingSlider = signal<boolean>(true);

  heroNews = signal([
    {
      title: 'Sentinels Dominate in VCT Americas Grand Finals',
      excerpt: 'TenZ and Zekken show up massive as Sentinels take down LOUD 3-0. The team looks completely unstoppable heading into the global playoffs next month.',
      timeAgo: '2 hours ago',
      category: 'Breaking News',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      route: '/news'
    },
    {
      title: 'CS2 Major Update: New Active Duty Map Pool',
      excerpt: 'Valve surprises the community with a massive update, rotating Overpass out and bringing back a fan-favorite map with complete visual overhauls.',
      timeAgo: '5 hours ago',
      category: 'CS2 Updates',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      route: '/news'
    },
    {
      title: 'Faker Extends Contract with T1 Through 2026',
      excerpt: 'The Unkillable Demon King will continue his legacy with T1 for another two years, aiming for yet another World Championship title.',
      timeAgo: '1 day ago',
      category: 'LoL Esports',
      imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
      route: '/news'
    }
  ]);
  currentNewsIndex = signal(0);
  private newsSliderTimer?: ReturnType<typeof setInterval>;

  selectedGame = 'all';
  readonly games: Game[] = [
    { name: 'All', slug: 'all' },
    { name: 'Valorant', slug: 'valorant' },
    { name: 'CS2', slug: 'cs2' },
    { name: 'League of Legends', slug: 'lol' },
    { name: 'Dota 2', slug: 'dota2' },
    { name: 'PUBG', slug: 'pubg' },
    { name: 'BGMI', slug: 'bgmi', comingSoon: true },
    { name: 'Free Fire', slug: 'freefire', comingSoon: true },
  ];

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

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.initTheme();
    this.syncPageFromUrl();
    this.loadStats();
    this.loadSliderMatches();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncPageFromUrl());
      
    if (isPlatformBrowser(this.platformId)) {
      this.startNewsSlider();
    }
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

  ngOnDestroy() {
    this.stopNewsSlider();
  }

  private startNewsSlider() {
    this.newsSliderTimer = setInterval(() => {
      this.nextNews();
    }, 6000);
  }

  private stopNewsSlider() {
    if (this.newsSliderTimer) clearInterval(this.newsSliderTimer);
  }

  private nextNews() {
    this.currentNewsIndex.update(i => (i + 1) % this.heroNews().length);
  }

  setNews(index: number) {
    this.currentNewsIndex.set(index);
    this.stopNewsSlider();
    if (isPlatformBrowser(this.platformId)) {
      this.startNewsSlider();
    }
  }

  private loadSliderMatches() {
    this.isLoadingSlider.set(true);
    this.matchService.getAllLiveMatches().subscribe({
      next: (allLive) => {
        this.sliderLiveMatches.set(allLive);
        this.isLoadingSlider.set(false);
      },
      error: () => {
        this.isLoadingSlider.set(false);
      },
    });
  }

  private loadStats() {
    const slug = this.selectedGame as GameSlug;
    this.matchService.getAllLiveMatches().subscribe({
      next: (matches) => this.liveMatchesCount.set(matches.length),
      error: () => this.liveMatchesCount.set(0),
    });
    this.matchService.getUpcomingMatches(slug).subscribe({
      next: (matches) => this.upcomingMatchesCount.set(matches.length),
      error: () => this.upcomingMatchesCount.set(0),
    });
    this.tournamentService.getRunningTournaments(slug).subscribe({
      next: (tournaments) => this.tournamentsCount.set(tournaments.length),
      error: () => this.tournamentsCount.set(0),
    });
  }

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
    this.router.navigate(['/homepage']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToMatch(match: UpcomingMatch): void {
    this.router.navigate(['/match', match.matchId], {
      state: { match }
    });
  }

  isHomePage(): boolean { return this.router.url === '/homepage'; }

  showMatchSection(): boolean {
    return !this.isHomePage();
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(`${route}/`);
  }

  navigateGame(game: Game): void {
    let section = this.currentSection() ?? 'upcoming';
    if (section === 'homepage') {
      section = 'upcoming';
    }
    this.selectedGame = game.slug;
    this.loadStats();
    this.router.navigate([section, game.slug]);
  }


  selectedGameName(): string {
    return this.games.find((game) => game.slug === this.selectedGame)?.name ?? 'Game';
  }

  currentSection(): string | null {
    return this.router.url.split('?')[0].split('/').filter(Boolean)[0] ?? null;
  }

  isGameDataSection(): boolean {
    return ['results', 'tournaments', 'teams', 'rankings'].includes(this.currentSection() ?? '');
  }

  gameDataSection(): GameSectionType {
    return this.currentSection() as GameSectionType;
  }

  private syncPageFromUrl(): void {
    const [, section, game] = this.router.url.split('?')[0].split('/');
    if (['upcoming', 'live', 'results', 'tournaments', 'teams', 'rankings'].includes(section) && this.games.some((item) => item.slug === game)) {
      this.selectedGame = game as GameSlug;
    } else if (section !== 'homepage') {
      this.selectedGame = 'all';
    }
  }
}
