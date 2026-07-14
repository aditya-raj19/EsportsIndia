import {ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

import { authInterceptor } from './services/auth.interceptor';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './services/auth.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  provideAppInitializer(() => {
       const authService = inject(AuthService);
      return firstValueFrom(authService.checkAuth());
    }),
    
   
  ]
};
