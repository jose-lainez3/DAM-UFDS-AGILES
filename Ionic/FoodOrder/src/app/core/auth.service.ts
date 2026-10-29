import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from './models';

const TOKEN_KEY = 'foodorder_token';
const USER_KEY = 'foodorder_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<Usuario | null>(this.leerUsuario());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user() && !!this.token);
  readonly rol = computed(() => this._user()?.rol?.nombre ?? '');

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** POST /api/auth/login → guarda el token Sanctum y el usuario. */
  async login(username: string, clave: string): Promise<void> {
    const data = await firstValueFrom(
      this.http.post<{ token: string; usuario: Usuario }>(`${environment.apiUrl}/auth/login`, { username, clave }),
    );
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    this._user.set(data.usuario);
  }

  /** Cierra sesión: limpia el estado local y revoca el token en el servidor (sin esperar). */
  logout(): void {
    const token = this.token;
    this.limpiar();

    if (token) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, null, { headers: { Authorization: `Bearer ${token}` } })
        .subscribe({ error: () => undefined });
    }
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /** Limpia la sesión sin navegar (lo usa el interceptor cuando el token caduca). */
  limpiar(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private leerUsuario(): Usuario | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
