import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
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

export type GameSlug = 'all' | 'valorant' | 'cs2' | 'lol' | 'dota2' | 'pubg';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private http = inject(HttpClient);

  getUpcomingMatches(game: GameSlug) {
    if (game === 'all') {
      return this.http.get<UpcomingMatch[]>(
        `${environment.apiUrl}/matches/valorant/upcoming`,
        { withCredentials: true }
      );
    }
    return this.http.get<UpcomingMatch[]>(
      `${environment.apiUrl}/matches/${game}/upcoming`,
      { withCredentials: true }
    );
  }

  getUpcomingValorantMatches() {
    return this.getUpcomingMatches('valorant');
  }

  private liveMatchesCache = new Map<GameSlug, Observable<UpcomingMatch[]>>();
  getLiveMatches(game: GameSlug) {
    if (game === 'all') {
      return this.getAllLiveMatches();
    }
    if (!this.liveMatchesCache.has(game)) {
      const req$ = this.http.get<UpcomingMatch[]>(
        `${environment.apiUrl}/matches/${game}/live`,
        { withCredentials: true }
      ).pipe(shareReplay(1));
      
      this.liveMatchesCache.set(game, req$);
      setTimeout(() => this.liveMatchesCache.delete(game), 15000);
    }
    return this.liveMatchesCache.get(game)!;
  }

  getPastMatches(game: GameSlug) {
    if (game === 'all') {
      return this.http.get<UpcomingMatch[]>(
        `${environment.apiUrl}/matches/valorant/past`,
        { withCredentials: true }
      );
    }
    return this.http.get<UpcomingMatch[]>(
      `${environment.apiUrl}/matches/${game}/past`,
      { withCredentials: true }
    );
  }

  private allLiveCache$?: Observable<UpcomingMatch[]>;
  /** Fetches ALL currently live matches across every game via PandaScore /lives */
  getAllLiveMatches() {
    if (!this.allLiveCache$) {
      this.allLiveCache$ = this.http.get<UpcomingMatch[]>(
        `${environment.apiUrl}/matches/valorant/all/live`,
        { withCredentials: true }
      ).pipe(shareReplay(1));
      
      setTimeout(() => this.allLiveCache$ = undefined, 15000);
    }
    return this.allLiveCache$;
  }
}
