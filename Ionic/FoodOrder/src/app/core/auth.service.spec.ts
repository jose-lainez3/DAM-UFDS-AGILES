import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthService + authInterceptor', () => {
  let auth: AuthService;
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  it('login guarda token y usuario, y las peticiones siguientes llevan Bearer', async () => {
    const promesa = auth.login('admin', 'admin123');

    const login = backend.expectOne(`${environment.apiUrl}/auth/login`);
    expect(login.request.body).toEqual({ username: 'admin', clave: 'admin123' });
    login.flush({ token: 'abc123', usuario: { id: 1, username: 'admin', correo: 'a@a', rol_id: 1, estado: 'activo', rol: { id: 1, nombre: 'Administrador' } } });
    await promesa;

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.rol()).toBe('Administrador');

    http.get(`${environment.apiUrl}/pedidos`).subscribe();
    const req = backend.expectOne(`${environment.apiUrl}/pedidos`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush([]);
  });

  it('registrar crea la cuenta y deja la sesión iniciada', async () => {
    const promesa = auth.registrar({ nombre: 'Ana', apellido: 'Pérez', correo: 'ana@mail.com', username: 'ana', clave: '123456' });

    const reg = backend.expectOne(`${environment.apiUrl}/auth/register`);
    expect(reg.request.method).toBe('POST');
    reg.flush({ token: 'nuevo', usuario: { id: 5, username: 'ana', correo: 'ana@mail.com', rol_id: 3, estado: 'activo' } });
    await promesa;

    expect(auth.isLoggedIn()).toBe(true);
    expect(localStorage.getItem('foodorder_token')).toBe('nuevo');
  });

  it('un 401 en una ruta protegida cierra la sesión local', async () => {
    const promesa = auth.login('admin', 'admin123');
    backend.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: 't', usuario: { id: 1, username: 'admin', correo: '', rol_id: 1, estado: 'activo' } });
    await promesa;

    http.get(`${environment.apiUrl}/pedidos`).subscribe({ error: () => undefined });
    backend.expectOne(`${environment.apiUrl}/pedidos`).flush({ message: 'Unauthenticated.' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.isLoggedIn()).toBe(false);
  });
});
