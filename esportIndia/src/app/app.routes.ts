import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { authGuard } from './services/auth.guard';
import { Signup} from './signup/signup';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'homepage', component: Home , canActivate: [authGuard]},
  { path: 'live', component: Home, canActivate: [authGuard] },
  { path: 'live/:game', component: Home, canActivate: [authGuard] },
  { path: 'upcoming', component: Home, canActivate: [authGuard] },
  { path: 'upcoming/:game', component: Home, canActivate: [authGuard] },
  { path: 'results', component: Home, canActivate: [authGuard] },
  { path: 'results/:game', component: Home, canActivate: [authGuard] },
  { path: 'teams', component: Home, canActivate: [authGuard] },
  { path: 'teams/:game', component: Home, canActivate: [authGuard] },
  { path: 'rankings', component: Home, canActivate: [authGuard] },
  { path: 'rankings/:game', component: Home, canActivate: [authGuard] },
];
