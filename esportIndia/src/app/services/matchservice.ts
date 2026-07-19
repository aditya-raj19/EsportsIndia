import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';


export interface Team {
  teamId: number;
  name: string;
  acronym: string;
  imageUrl: string;
  score?: number;
}

export interface Stream {
  rawUrl: string;
  language: string;
  isMain: boolean;
  isOfficial: boolean;
}

export interface ValorantMatch {
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
  streams: Stream[];
  teams: Team[];
}

export interface UpcomingMatch extends ValorantMatch {}

export type GameSlug = 'valorant' | 'cs2' | 'lol' | 'dota2' | 'pubg';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private http = inject(HttpClient);

  getUpcomingMatches(game: GameSlug) {
    return this.http.get<UpcomingMatch[]>(
      `${environment.apiUrl}/matches/${game}/upcoming`,
      { withCredentials: true }
    );
  }

  getUpcomingValorantMatches() {
    return this.getUpcomingMatches('valorant');
  }

  getLiveMatches(game: GameSlug) {
    return this.http.get<UpcomingMatch[]>(
      `${environment.apiUrl}/matches/${game}/live`,
      { withCredentials: true }
    );
  }

  getPastMatches(game: GameSlug) {
    return this.http.get<UpcomingMatch[]>(
      `${environment.apiUrl}/matches/${game}/past`,
      { withCredentials: true }
    );
  }
}
