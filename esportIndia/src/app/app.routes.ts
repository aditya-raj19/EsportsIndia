import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { authGuard } from './services/auth.guard';
import path from 'path';
import { Signup} from './signup/signup';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
//   {path: '', redirectTo: 'signup', pathMatch: 'full'},
  {path: 'signup', component: Signup},
  { path: 'homepage', component: Home , canActivate: [authGuard]},
];
