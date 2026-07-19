import { Component, input, inject, signal, OnInit, OnDestroy, OnChanges, SimpleChanges, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GameSlug, MatchService, UpcomingMatch } from '../services/matchservice';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-live-matches',
  standalone: true,
  imports: [],
  templateUrl: './live-matches.html',
  styleUrl: './live-matches.css',
})
export class LiveMatches implements OnInit, OnChanges, OnDestroy {
  readonly game = input.required<GameSlug>();
  readonly gameName = input.required<string>();

  private readonly matchService = inject(MatchService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly matches = signal<UpcomingMatch[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  private pollSubscription?: Subscription;

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Avoid double startPolling call on initial component mount
    if (changes['game'] && !changes['game'].isFirstChange()) {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    if (!this.game()) return;

    // Show loading spinner only on initial load when matches are empty
    if (this.matches().length === 0) {
      this.loading.set(true);
    }
    this.errorMsg.set(null);

    // Prevents SSR/Prerender timeout during build: do single fetch on server, don't run recurring timer!
    if (!isPlatformBrowser(this.platformId)) {
      this.matchService.getLiveMatches(this.game()).subscribe({
        next: (matches) => {
          this.matches.set(matches);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      return;
    }

    // Poll backend every 30 seconds seamlessly in browser
    this.pollSubscription = timer(0, 30000)
      .pipe(switchMap(() => this.matchService.getLiveMatches(this.game())))
      .subscribe({
        next: (matches) => {
          this.matches.set(matches);
          this.loading.set(false);
        },
        error: () => {
          if (this.matches().length === 0) {
            this.errorMsg.set('Live match data is temporarily unavailable.');
          }
          this.loading.set(false);
        },
      });
  }

  private stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  getStreamPlatform(url: string): string {
    if (!url) return 'Stream';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'YouTube';
    if (lowerUrl.includes('twitch.tv')) return 'Twitch';
    return 'Stream';
  }
}
