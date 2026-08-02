import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Signup} from './signup/signup';
import { Privacy } from './privacy/privacy';
import { Terms } from './terms/terms';
import { TournamentDetails } from './tournament-details/tournament-details';
import { MatchDetails } from './match-details/match-details';

export const routes: Routes = [
    { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'tournament/:id', component: TournamentDetails },
  { path: 'match/:id', component: MatchDetails },
  { path: 'privacy', component: Privacy },
  { path: 'terms', component: Terms },
  
  // Catch-all parameterized routes for Home component sections 
  // (homepage, live, upcoming, results, tournaments, teams, rankings, news)
  // This enables RouteReuse, preventing component destruction/flicker on navigation
  { path: ':section', component: Home },
  { path: ':section/:game', component: Home },
];

