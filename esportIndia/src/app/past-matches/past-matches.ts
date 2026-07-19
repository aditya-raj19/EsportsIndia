import { Component, input, inject, signal, computed, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { GameSlug, MatchService, UpcomingMatch } from '../services/matchservice';
import { Dropdown } from '../dropdown/dropdown';

@Component({
  selector: 'app-past-matches',
  standalone: true,
  imports: [Dropdown],
  templateUrl: './past-matches.html',
  styleUrl: './past-matches.css',
})
export class PastMatches implements OnInit, OnChanges {
  readonly game = input.required<GameSlug>();
  readonly gameName = input.required<string>();

  private readonly matchService = inject(MatchService);
  readonly matches = signal<UpcomingMatch[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly selectedTournament = signal<string | null>(null);

  readonly tournaments = computed(() => {
    // Filter by serieName instead of leagueName for better granularity
    const allSeries = this.matches().map((m) => m.serieName).filter((name) => !!name);
    return Array.from(new Set(allSeries)).sort();
  });

  readonly filteredMatches = computed(() => {
    const selected = this.selectedTournament();
    if (!selected) {
      return this.matches();
    }
    return this.matches().filter((m) => m.serieName === selected);
  });

  ngOnInit(): void {
    this.loadMatches();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Avoid double API call on component mount (ngOnInit handles initial load)
    if (changes['game'] && !changes['game'].isFirstChange()) {
      this.loadMatches();
    }
  }

  private loadMatches(): void {
    if (!this.game()) return;

    this.loading.set(true);
    this.errorMsg.set(null);
    this.matches.set([]); // Clear matches when changing games
    this.matchService.getPastMatches(this.game()).subscribe({
      next: (matches) => {
        this.matches.set(matches);
        this.selectedTournament.set(null); // Reset filter on load
        this.loading.set(false);
      },
      error: () => {
        this.matches.set([]);
        this.errorMsg.set('Past match data is temporarily unavailable.');
        this.loading.set(false);
      },
    });
  }
}

