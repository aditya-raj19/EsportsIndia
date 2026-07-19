import { Component, OnInit, OnChanges, SimpleChanges, inject, signal, computed, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GameSlug, MatchService, UpcomingMatch } from '../services/matchservice';
import { MatchCountdown } from '../match-countdown/match-countdown';
import { Dropdown } from '../dropdown/dropdown';

@Component({
  selector: 'app-valorant',
  standalone: true,
  imports: [CommonModule, DatePipe, MatchCountdown, Dropdown],
  templateUrl: './valorant.html',
  styleUrl: './valorant.css',
})
export class Valorant implements OnInit, OnChanges {
  readonly game = input<GameSlug>('valorant');
  readonly gameName = input<string>('Valorant');

  private matchService = inject(MatchService);

  matches = signal<UpcomingMatch[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  selectedTournament = signal<string | null>(null);

  tournaments = computed(() => {
    const allSeries = this.matches().map((m) => {
      if (m.leagueName && m.serieName) return `${m.leagueName} - ${m.serieName}`;
      if (m.leagueName) return m.leagueName;
      return m.serieName;
    }).filter((name) => !!name);
    return Array.from(new Set(allSeries)).sort() as string[];
  });

  filteredMatches = computed(() => {
    const selected = this.selectedTournament();
    if (!selected) {
      return this.matches();
    }
    return this.matches().filter((m) => {
      const matchName = (m.leagueName && m.serieName) ? `${m.leagueName} - ${m.serieName}` : (m.leagueName || m.serieName);
      return matchName === selected;
    });
  });

  ngOnInit() {
    this.fetchMatches();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['game'] && !changes['game'].isFirstChange()) {
      this.fetchMatches();
    }
  }

  private fetchMatches() {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.selectedTournament.set(null);
    this.matches.set([]); // Clear matches when changing games!

    this.matchService.getUpcomingMatches(this.game()).subscribe({
      next: (data) => {
        const now = Date.now();
        const futureMatches = data.filter(m => !m.beginAt || new Date(m.beginAt).getTime() > now);
        this.matches.set(futureMatches);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Could not load upcoming matches.');
        this.loading.set(false);
      },
    });
  }

  getStreamPlatform(url: string): string {
    if (!url) return 'Stream';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'YouTube';
    if (lowerUrl.includes('twitch.tv')) return 'Twitch';
    return 'Stream';
  }
}
