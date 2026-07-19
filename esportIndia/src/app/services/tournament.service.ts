import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { GameSlug } from './matchservice';

export interface TournamentTeam {
  teamId: number;
  name: string;
  acronym: string;
  imageUrl: string;
}

export interface TournamentMatch {
  id: number;
  name: string;
  status: string;
  beginAt: string;
  endAt: string;
  scheduledAt: string;
  matchType: string;
  numberOfGames: number;
}

export interface Tournament {
  id: number;
  name: string;
  status: string;
  beginAt: string;
  endAt: string;
  tier: string;
  prizepool: string;
  region: string;
  videogameName?: string;
  leagueId: number;
  leagueName: string;
  leagueImageUrl: string;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
}

export interface Standing {
  rank: number;
  teamId: number;
  teamName: string;
  teamAcronym: string;
  teamImageUrl: string;
  wins: number;
  losses: number;
  ties: number;
  points: number;
}

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private http = inject(HttpClient);

  getRunningTournaments(game: GameSlug): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(
      `${environment.apiUrl}/tournaments/${game}/running`,
      { withCredentials: true }
    );
  }

  getUpcomingTournaments(game: GameSlug): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(
      `${environment.apiUrl}/tournaments/${game}/upcoming`,
      { withCredentials: true }
    );
  }

  getTournamentStandings(tournamentId: number): Observable<Standing[]> {
    return this.http.get<Standing[]>(
      `${environment.apiUrl}/tournaments/${tournamentId}/standings`,
      { withCredentials: true }
    );
  }
}
