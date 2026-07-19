import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Signup} from './signup/signup';

export const routes: Routes = [
    { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'homepage', component: Home },
  { path: 'live', component: Home },
  { path: 'live/:game', component: Home },
  { path: 'upcoming', component: Home },
  { path: 'upcoming/:game', component: Home },
  { path: 'results', component: Home },
  { path: 'results/:game', component: Home },
  { path: 'tournaments', component: Home },
  { path: 'tournaments/:game', component: Home },
  { path: 'teams', component: Home },
  { path: 'teams/:game', component: Home },
  { path: 'rankings', component: Home },
  { path: 'rankings/:game', component: Home },
];
