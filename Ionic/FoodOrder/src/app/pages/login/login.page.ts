import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton, IonContent, IonInput, IonInputPasswordToggle, IonItem, IonList, IonNote, IonSpinner, IonText,
} from '@ionic/angular';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IonContent, IonList, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonText, IonNote, IonSpinner],
  template: `
    <ion-content class="ion-padding" [fullscreen]="true">
      <div class="login">
        <div class="login__brand">
          <div class="login__logo">🍽️</div>
          <h1>FoodOrder</h1>
          <ion-note>Sistema de gestión de pedidos</ion-note>
        </div>

        <form (ngSubmit)="entrar()">
          <ion-list lines="none" class="login__list">
            <ion-item>
              <ion-input
                label="Usuario"
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
      </div>
    </ion-content>
  `,
  styles: `
    .login { max-width: 420px; margin: 0 auto; padding-top: 12vh; }
    .login__brand { text-align: center; margin-bottom: 32px; }
    .login__logo { font-size: 56px; }
    .login__brand h1 { margin: 4px 0; font-weight: 800; }
    .login__list { background: transparent; margin-bottom: 8px; }
    .login__list ion-item { margin-bottom: 12px; --border-radius: 12px; }
    .login__error { margin: 4px 0 16px; font-size: 14px; }
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  clave = '';
  cargando = signal(false);
  error = signal('');

  async entrar() {
    if (!this.username.trim() || !this.clave || this.cargando()) return;

    this.error.set('');
    this.cargando.set(true);
    try {
      await this.auth.login(this.username.trim(), this.clave);
      this.clave = '';
      await this.router.navigateByUrl('/tabs/pedidos', { replaceUrl: true });
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo iniciar sesión.'));
    } finally {
      this.cargando.set(false);
    }
  }
}
