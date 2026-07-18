import { Component, input } from '@angular/core';

export type GameSectionType = 'results' | 'teams' | 'rankings';

@Component({
  selector: 'app-game-section',
  standalone: true,
  templateUrl: './game-section.html',
  styleUrl: './game-section.css',
})
export class GameSection {
  readonly section = input.required<GameSectionType>();
  readonly gameName = input.required<string>();

  heading(): string {
    const labels: Record<GameSectionType, string> = { results: 'Results', teams: 'Teams', rankings: 'Rankings' };
    return `${this.gameName()} ${labels[this.section()]}`;
  }

  emptyMessage(): string {
    const messages: Record<GameSectionType, string> = {
      results: `No recent ${this.gameName()} results are available.`,
      teams: `No ${this.gameName()} teams are available yet.`,
      rankings: `No ${this.gameName()} rankings are available yet.`,
    };
    return messages[this.section()];
  }
}
