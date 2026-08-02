import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UpcomingMatch } from '../services/matchservice';

@Component({
  selector: 'app-live-ticker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-ticker.html',
})
export class LiveTicker {
  @Input() matches: UpcomingMatch[] = [];

  private router = inject(Router);

  navigateToMatch(match: UpcomingMatch): void {
    this.router.navigate(['/match', match.matchId], {
      state: { match }
    });
  }

  // Simulate scrolling the ticker left or right
  scrollTicker(direction: 'left' | 'right') {
    const container = document.getElementById('ticker-container');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }
}
