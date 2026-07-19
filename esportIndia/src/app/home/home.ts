import { Component, signal, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Valorant } from '../valorant/valorant';
import { LiveMatches } from '../live-matches/live-matches';
import { PastMatches } from '../past-matches/past-matches';
import { Tournaments } from '../tournaments/tournaments';
import { Rankings } from '../rankings/rankings';
import { GameSlug, MatchService, UpcomingMatch } from '../services/matchservice';
import { GameSection, GameSectionType } from '../game-section/game-section';
import { TournamentService } from '../services/tournament.service';

interface Game {
  name: string;
  slug: GameSlug;
}

@Component({
  selector: 'app-home',
  imports: [Valorant, LiveMatches, PastMatches, Tournaments, Rankings, GameSection],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private matchService = inject(MatchService);
  private tournamentService = inject(TournamentService);
  private platformId = inject(PLATFORM_ID);

  loading = signal(false);
  signedOut = signal(false);
  errorMsg = signal<string | null>(null);

  liveMatchesCount = signal<number>(0);
  upcomingMatchesCount = signal<number>(0);
  tournamentsCount = signal<number>(0);

  sliderLiveMatches = signal<UpcomingMatch[]>([]);
  currentSlide = signal<number>(0);
  isAnimating = signal<boolean>(false);
  isLoadingSlider = signal<boolean>(true);
  private sliderTimer?: ReturnType<typeof setInterval>;

  selectedGame = 'all';
  readonly games: Game[] = [
    { name: 'All', slug: 'all' },
    { name: 'Valorant', slug: 'valorant' },
    { name: 'CS2', slug: 'cs2' },
    { name: 'League of Legends', slug: 'lol' },
    { name: 'Dota 2', slug: 'dota2' },
    { name: 'PUBG', slug: 'pubg' },
  ];

  readonly menus = [
    { label: 'Home', route: '/homepage' },
    { label: 'Live', route: '/live' },
    { label: 'Upcoming', route: '/upcoming' },
    { label: 'Results', route: '/results' },
    { label: 'Tournaments', route: '/tournaments' },
    { label: 'Teams', route: '/teams' },
    { label: 'Rankings', route: '/rankings' },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.syncPageFromUrl();
    this.loadStats();
    this.loadSliderMatches();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncPageFromUrl());
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  private loadSliderMatches() {
    this.isLoadingSlider.set(true);
    this.matchService.getAllLiveMatches().subscribe({
      next: (allLive) => {
        this.sliderLiveMatches.set(allLive);
        if (allLive.length > 1 && isPlatformBrowser(this.platformId)) {
          this.startAutoSlide();
        }
        this.triggerSlideAnim();
        this.isLoadingSlider.set(false);
      },
      error: () => {
        this.isLoadingSlider.set(false);
      },
    });
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.sliderTimer = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
      this.sliderTimer = undefined;
    }
  }

  nextSlide() {
    const total = this.sliderLiveMatches().length;
    if (total === 0) return;
    this.triggerSlideAnim();
    this.currentSlide.set((this.currentSlide() + 1) % total);
  }

  prevSlide() {
    const total = this.sliderLiveMatches().length;
    if (total === 0) return;
    this.triggerSlideAnim();
    this.currentSlide.set((this.currentSlide() - 1 + total) % total);
  }

  goToSlide(index: number) {
    if (this.currentSlide() === index) return;
    this.triggerSlideAnim();
    this.currentSlide.set(index);
  }

  private triggerSlideAnim() {
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 350);
  }

  getStreamPlatform(url: string): string {
    if (!url) return 'Stream';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'YouTube';
    if (lowerUrl.includes('twitch.tv')) return 'Twitch';
    return 'Stream';
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

  isHomePage(): boolean { return this.router.url === '/homepage'; }

  showMatchSection(): boolean {
    return ['upcoming', 'live', 'results', 'tournaments', 'teams', 'rankings']
      .some((section) => this.router.url === `/${section}` || this.router.url.startsWith(`/${section}/`));
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(`${route}/`);
  }

  navigateGame(game: Game): void {
    const section = this.currentSection() ?? 'upcoming';
    this.selectedGame = game.slug;
    this.loadStats();
    this.router.navigate([section, game.slug]);
  }

  isGameActive(game: Game): boolean {
    return this.selectedGame === game.slug;
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
