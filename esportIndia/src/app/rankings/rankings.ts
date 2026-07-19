import { Component, input, inject, signal, computed, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tournament, TournamentService, Standing } from '../services/tournament.service';
import { GameSlug } from '../services/matchservice';
import { SearchComponent } from '../shared/search/search.component';
import { Dropdown } from '../dropdown/dropdown';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent],
  templateUrl: './rankings.html',
  styleUrl: './rankings.css',
})
export class Rankings implements OnInit, OnChanges {
  readonly game = input.required<GameSlug>();
  readonly gameName = input.required<string>();

  private readonly tournamentService = inject(TournamentService);

  readonly tournaments = signal<Tournament[]>([]);
  readonly selectedTournament = signal<Tournament | null>(null);
  
  readonly standings = signal<Standing[]>([]);
  
  readonly hasWins = computed(() => this.standings().some(s => s.wins > 0));
  readonly hasLosses = computed(() => this.standings().some(s => s.losses > 0));
  readonly hasTies = computed(() => this.standings().some(s => s.ties > 0));
  readonly hasPoints = computed(() => this.standings().some(s => s.points > 0));

  readonly loadingTournaments = signal(false);
  readonly loadingStandings = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly selectedVideogame = signal<string>('All Games');
  
  readonly availableGames = computed(() => {
    const games = this.tournaments()
      .map(t => t.videogameName)
      .filter((g): g is string => !!g);
    return ['All Games', ...Array.from(new Set(games)).sort()];
  });

  readonly filteredTournaments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const gameFilter = this.selectedVideogame();
    
    let list = this.tournaments();
    
    if (gameFilter !== 'All Games') {
      list = list.filter(t => t.videogameName === gameFilter);
    }
    
    if (q) {
      list = list.filter(t => 
        (t.leagueName && t.leagueName.toLowerCase().includes(q)) || 
        (t.name && t.name.toLowerCase().includes(q)) || 
        (t.videogameName && t.videogameName.toLowerCase().includes(q))
      );
    }
    
    return list;
  });

  ngOnInit(): void {
    this.fetchTournaments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['game'] && !changes['game'].isFirstChange()) {
      this.fetchTournaments();
    }
  }

  private fetchTournaments(): void {
    if (!this.game()) return;
    
    this.loadingTournaments.set(true);
    this.errorMsg.set(null);
    this.tournaments.set([]);
    this.selectedTournament.set(null);
    this.standings.set([]);

    this.tournamentService.getRunningTournaments(this.game()).subscribe({
      next: (running) => {
        this.tournaments.set(running);
        if (running.length > 0) {
          this.selectTournament(running[0]);
        }
        this.loadingTournaments.set(false);
      },
      error: () => {
        this.errorMsg.set('Unable to load tournaments.');
        this.loadingTournaments.set(false);
      }
    });
  }

  selectTournament(t: Tournament) {
    this.selectedTournament.set(t);
    this.loadingStandings.set(true);
    this.standings.set([]);
    
    this.tournamentService.getTournamentStandings(t.id).subscribe({
      next: (data) => {
        this.standings.set(data.sort((a,b) => a.rank - b.rank));
        this.loadingStandings.set(false);
      },
      error: () => {
        this.errorMsg.set('Unable to load standings.');
        this.loadingStandings.set(false);
      }
    });
  }

  onMobileSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    const t = this.tournaments().find(x => x.id === id);
    if (t) {
      this.selectTournament(t);
    }
  }

}
