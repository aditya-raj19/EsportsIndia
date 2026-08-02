import { Component, input, output } from '@angular/core';
import { GameSlug } from '../../services/matchservice';

export interface Game {
  name: string;
  slug: GameSlug;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-game-tabs',
  standalone: true,
  templateUrl: './game-tabs.html',
})
export class GameTabs {
  readonly games = input.required<Game[]>();
  readonly selectedGame = input.required<string>();
  readonly gameSelected = output<Game>();

  onSelect(game: Game) {
    if (!game.comingSoon) {
      this.gameSelected.emit(game);
    }
  }
}
