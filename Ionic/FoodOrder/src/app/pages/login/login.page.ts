import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton, IonContent, IonInput, IonInputPasswordToggle, IonItem, IonList, IonNote, IonSpinner, IonText,
} from '@ionic/angular';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IonContent, IonList, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonText, IonNote, IonSpinner],
  template: `
    <ion-content class="ion-padding" [fullscreen]="true" [class.login-content--native]="esAppNativa">
      <div class="login" [class.login--native]="esAppNativa">
        <div class="login__brand">
          <div class="login-brand">
  <img
    src="assets/logo.png"
    alt="Logo de FoodOrder"
    class="login-logo"
  />

  <h1>FoodOrder</h1>
  <p>Tu comida favorita, a un toque</p>
</div>
          
        </div>

        <form (ngSubmit)="entrar()">
          <ion-list lines="none" class="login__list">
            <ion-item>
              <ion-input
                label="Usuario o correo"
                labelPlacement="floating"
                name="username"
                autocomplete="username"
                autocapitalize="off"
                [(ngModel)]="username"
              />
            </ion-item>
            <ion-item>
              <ion-input
                label="Contraseña"
                labelPlacement="floating"
                name="clave"
                type="password"
                autocomplete="current-password"
                [(ngModel)]="clave"
              >
                <ion-input-password-toggle slot="end" />
              </ion-input>
            </ion-item>
          </ion-list>

          @if (error()) {
            <ion-text color="danger"><p class="login__error" role="alert">{{ error() }}</p></ion-text>
          }

          <ion-button type="submit" expand="block" [disabled]="!username.trim() || !clave || cargando()">
            @if (cargando()) { <ion-spinner name="dots" /> } @else { Iniciar sesión }
          </ion-button>
        </form>

        <ion-button expand="block" fill="outline" routerLink="/registro" [queryParams]="{ returnUrl: returnUrl }">
          Crear cuenta
        </ion-button>
        <ion-button expand="block" fill="clear" routerLink="/tabs/menu">Explorar el menú sin cuenta</ion-button>
      </div>
    </ion-content>
  `,
  styles: `
    .login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 38px;
  text-align: center;
}

.login-logo {
  width: 115px;
  height: 115px;
  object-fit: contain;
  display: block;
}

.login-brand h1 {
  margin: 0;
  color: #10372f;
  font-size: 28px;
  font-weight: 800;
}

.login-brand p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/*
 * Diseño exclusivo del APK (Capacitor Android / iOS).
 * En el navegador no se aplica ninguna de estas reglas.
 */
.login-content--native {
  --background: #f7f8f6;
  --padding-top: 0px;
  --padding-bottom: 0px;
}
.login-content--native::part(scroll) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
}
.login--native {
  width: 100%;
  max-width: 410px;
  margin: 0 auto;
  padding: clamp(18px, 4vh, 38px) 6px;
}
.login--native .login__brand {
  margin-bottom: 22px;
}
.login--native .login-brand {
  gap: 7px;
  margin-bottom: 0;
}
.login--native .login-logo {
  width: 106px;
  height: 106px;
  border-radius: 18px;
}
.login--native .login-brand h1 {
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: -0.8px;
}
.login--native .login-brand p {
  font-size: 13px;
  line-height: 1.5;
}
.login--native form {
  margin: 0;
}
.login--native .login__list {
  margin: 0 0 14px;
  padding: 2px 0;
  border: 1px solid #e2e9e5;
  border-radius: 17px;
  background: #fff;
  overflow: hidden;
}
.login--native .login__list ion-item {
  --background: #fff;
  --min-height: 59px;
  --padding-start: 16px;
  --inner-padding-end: 12px;
  --border-color: #e9eeeb;
  margin: 0;
}
.login--native ion-button {
  --border-radius: 12px;
  min-height: 47px;
  margin: 9px 0 0;
  font-size: 14px;
  font-weight: 650;
}
.login--native .login__error {
  margin: 4px 0 12px;
  font-size: 13px;
}
@media (max-height: 680px) {
  .login-content--native::part(scroll) {
    justify-content: flex-start;
  }
  .login--native {
    padding-top: 18px;
    padding-bottom: 18px;
  }
  .login--native .login__brand {
    margin-bottom: 15px;
  }
  .login--native .login-logo {
    width: 84px;
    height: 84px;
  }
}
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Solo el APK usa la composición centrada: la interfaz web no cambia. */
  readonly esAppNativa = Capacitor.isNativePlatform();

  username = '';
  clave = '';
  cargando = signal(false);
  error = signal('');

  /** A dónde volver después de entrar (p. ej. al carrito si venía a confirmar un pedido). */
  returnUrl = this.destino();

  async entrar() {
    if (!this.username.trim() || !this.clave || this.cargando()) return;

    this.error.set('');
    this.cargando.set(true);
    try {
      await this.auth.login(this.username.trim(), this.clave);
      this.clave = '';
      await this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo iniciar sesión.'));
    } finally {
      this.cargando.set(false);
    }
  }

  private destino(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
    // Solo rutas internas de la app
    return url.startsWith('/tabs') ? url : '/tabs/menu';
  }
}
