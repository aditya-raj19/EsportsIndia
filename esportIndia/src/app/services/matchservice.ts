import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';


export interface Team {
  teamId: number;
  name: string;
  acronym: string;
  imageUrl: string;
}

export interface UpcomingMatch {
  matchId: string;
  matchName: string;
  status: string;
  beginAt: string;
  leagueName: string;
  tournamentName: string;
  serieName: string;
  videogameName: string;
  numberOfGames: number;
  streamUrl: string;
  teams: Team[];
}

export type GameSlug = 'valorant' | 'cs2' | 'lol' | 'dota2' | 'pubg';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private http = inject(HttpClient);

  getUpcomingValorantMatches() {
    return this.http.get<UpcomingMatch[]>(
      `${environment.apiUrl}/matches/valorant/upcoming`,
      { withCredentials: true }
    );
  }

  getLiveMatches(game: GameSlug) {
    return this.http.get<UpcomingMatch[]>(
      `${environment.apiUrl}/matches/${game}/live`,
      { withCredentials: true }
    );
  }
}
