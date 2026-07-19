import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatchService, UpcomingMatch } from '../services/matchservice';
import { MatchCountdown } from '../match-countdown/match-countdown';
import { Dropdown } from '../dropdown/dropdown';

@Component({
  selector: 'app-valorant',
  standalone: true,
  imports: [CommonModule, DatePipe, MatchCountdown, Dropdown],
  templateUrl: './valorant.html',
  styleUrl: './valorant.css',
})
export class Valorant implements OnInit {
  private matchService = inject(MatchService);

  matches = signal<UpcomingMatch[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  selectedTournament = signal<string | null>(null);

  tournaments = computed(() => {
    const allSeries = this.matches().map((m) => m.serieName).filter((name) => !!name);
    return Array.from(new Set(allSeries)).sort();
  });

  filteredMatches = computed(() => {
    const selected = this.selectedTournament();
    if (!selected) {
      return this.matches();
    }
    return this.matches().filter((m) => m.serieName === selected);
  });

  ngOnInit() {
    this.matchService.getUpcomingValorantMatches().subscribe({
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
