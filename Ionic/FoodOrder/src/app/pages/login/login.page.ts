import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    <ion-content class="ion-padding" [fullscreen]="true">
      <div class="login">
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
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
