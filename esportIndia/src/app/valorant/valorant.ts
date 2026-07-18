import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatchService, UpcomingMatch } from '../services/matchservice';
import { MatchCountdown } from '../match-countdown/match-countdown';


@Component({
  selector: 'app-valorant',
  standalone: true,
  imports: [CommonModule, DatePipe, MatchCountdown],
  templateUrl: './valorant.html',
  styleUrl: './valorant.css',
})
export class Valorant implements OnInit {
  private matchService = inject(MatchService);

  matches = signal<UpcomingMatch[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    this.matchService.getUpcomingValorantMatches().subscribe({
      next: (data) => {
        this.matches.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Could not load upcoming matches.');
        this.loading.set(false);
      },
    });
  }
}
