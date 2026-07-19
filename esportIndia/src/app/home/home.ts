import { Component, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Valorant } from '../valorant/valorant';
import { LiveMatches } from '../live-matches/live-matches';
import { PastMatches } from '../past-matches/past-matches';
import { GameSlug } from '../services/matchservice';
import { GameSection, GameSectionType } from '../game-section/game-section';

interface Game {
  name: string;
  slug: GameSlug;
}

@Component({
  selector: 'app-home',
  imports: [Valorant, LiveMatches, PastMatches, GameSection],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  loading = signal(false);
  signedOut = signal(false);
  errorMsg = signal<string | null>(null);

  selectedGame = 'valorant';
  readonly games: Game[] = [
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
    { label: 'Teams', route: '/teams' },
    { label: 'Rankings', route: '/rankings' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.syncPageFromUrl();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncPageFromUrl());
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
    return ['upcoming', 'live', 'results', 'teams', 'rankings']
      .some((section) => this.router.url === `/${section}` || this.router.url.startsWith(`/${section}/`));
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(`${route}/`);
  }

  navigateGame(game: Game): void {
    const section = this.currentSection() ?? 'upcoming';
    this.selectedGame = game.slug;
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
    return ['results', 'teams', 'rankings'].includes(this.currentSection() ?? '');
  }

  gameDataSection(): GameSectionType {
    return this.currentSection() as GameSectionType;
  }

  private syncPageFromUrl(): void {
    const [, section, game] = this.router.url.split('?')[0].split('/');
    if (['upcoming', 'live', 'results', 'teams', 'rankings'].includes(section) && this.games.some((item) => item.slug === game)) {
      this.selectedGame = game as GameSlug;
    } else if (section !== 'homepage') {
      this.selectedGame = 'valorant';
    }
  }
}
