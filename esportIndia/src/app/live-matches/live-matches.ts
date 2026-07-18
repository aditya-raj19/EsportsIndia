import { Component, input, inject, signal } from '@angular/core';
import { GameSlug, MatchService, UpcomingMatch } from '../services/matchservice';

@Component({
  selector: 'app-live-matches',
  standalone: true,
  imports: [],
  templateUrl: './live-matches.html',
  styleUrl: './live-matches.css',
})
export class LiveMatches {
  readonly game = input.required<GameSlug>();
  readonly gameName = input.required<string>();

  private readonly matchService = inject(MatchService);
  readonly matches = signal<UpcomingMatch[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  ngOnChanges(): void {
    this.loadMatches();
  }

  private loadMatches(): void {
    if (!this.game()) return;

    this.loading.set(true);
    this.errorMsg.set(null);
    this.matchService.getLiveMatches(this.game()).subscribe({
      next: (matches) => {
        this.matches.set(matches);
        this.loading.set(false);
      },
      error: () => {
        this.matches.set([]);
        this.errorMsg.set('Live match data is temporarily unavailable.');
        this.loading.set(false);
      },
    });
  }
}
