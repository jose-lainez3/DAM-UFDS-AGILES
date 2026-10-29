import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Convierte un error HTTP de Laravel en un mensaje legible. */
export function errorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return `No se pudo conectar con el servidor (${environment.apiUrl}). Comprueba que Laravel esté en marcha.`;
    }

    const body = error.error;
    if (body?.errors) {
      return (Object.values(body.errors) as string[][]).flat().join(' ');
    }
    if (body?.message) {
      return body.message;
    }
  }
  return fallback;
}
