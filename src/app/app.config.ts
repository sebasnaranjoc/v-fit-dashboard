import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(localeEsCO);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    // Locale colombiano: miles con '.', decimales con ','
    { provide: LOCALE_ID, useValue: 'es-CO' },
    // Moneda por defecto para el pipe currency
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'COP' },
  ],
};
