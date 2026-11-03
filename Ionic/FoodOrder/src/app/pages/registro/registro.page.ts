import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonInputPasswordToggle, IonItem, IonList,
  IonSpinner, IonText, IonTitle, IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';

@Component({
  selector: 'app-registro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonList, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonText, IonSpinner],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/login" text="Atrás" /></ion-buttons>
        <ion-title>Crear cuenta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="registrar()" class="form">
        <ion-list lines="none" class="lista">
          <ion-item><ion-input label="Nombre" labelPlacement="floating" name="nombre" autocomplete="given-name" [ngModel]="nombre()" (ngModelChange)="nombre.set($event)" /></ion-item>
          <ion-item><ion-input label="Apellido" labelPlacement="floating" name="apellido" autocomplete="family-name" [ngModel]="apellido()" (ngModelChange)="apellido.set($event)" /></ion-item>
          <ion-item><ion-input label="Correo electrónico" labelPlacement="floating" name="correo" type="email" autocomplete="email" autocapitalize="off" [ngModel]="correo()" (ngModelChange)="correo.set($event)" /></ion-item>
          <ion-item><ion-input label="Teléfono (opcional)" labelPlacement="floating" name="telefono" type="tel" autocomplete="tel" [ngModel]="telefono()" (ngModelChange)="telefono.set($event)" /></ion-item>
          <ion-item><ion-input label="Nombre de usuario" labelPlacement="floating" name="username" autocomplete="username" autocapitalize="off" [ngModel]="username()" (ngModelChange)="username.set($event)" /></ion-item>
          <ion-item>
            <ion-input label="Contraseña (mín. 6 caracteres)" labelPlacement="floating" name="clave" type="password" autocomplete="new-password" [ngModel]="clave()" (ngModelChange)="clave.set($event)">
              <ion-input-password-toggle slot="end" />
            </ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Repetir contraseña" labelPlacement="floating" name="clave2" type="password" autocomplete="new-password" [ngModel]="clave2()" (ngModelChange)="clave2.set($event)" />
          </ion-item>
        </ion-list>

        @if (aviso()) {
          <ion-text color="danger"><p class="error" role="alert">{{ aviso() }}</p></ion-text>
        }

        <ion-button type="submit" expand="block" [disabled]="!valido() || cargando()">
          @if (cargando()) { <ion-spinner name="dots" /> } @else { Registrarme }
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: `
    .form { max-width: 420px; margin: 0 auto; }
    .lista { background: transparent; }
    .lista ion-item { margin-bottom: 12px; --border-radius: 12px; }
    .error { margin: 4px 0 16px; font-size: 14px; }
  `,
})
export class RegistroPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  nombre = signal('');
  apellido = signal('');
  correo = signal('');
  telefono = signal('');
  username = signal('');
  clave = signal('');
  clave2 = signal('');

  cargando = signal(false);
  error = signal('');

  private correoOk = computed(() => /^\S+@\S+\.\S+$/.test(this.correo().trim()));

  aviso = computed(() => {
    if (this.error()) return this.error();
    if (this.clave() && this.clave().length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (this.clave2() && this.clave() !== this.clave2()) return 'Las contraseñas no coinciden.';
    if (this.correo() && !this.correoOk()) return 'Escribe un correo válido.';
    return '';
  });

  valido = computed(
    () =>
      !!this.nombre().trim() &&
      !!this.apellido().trim() &&
      this.correoOk() &&
      !!this.username().trim() &&
      this.clave().length >= 6 &&
      this.clave() === this.clave2(),
  );

  async registrar() {
    if (!this.valido() || this.cargando()) return;

    this.error.set('');
    this.cargando.set(true);
    try {
      await this.auth.registrar({
        nombre: this.nombre().trim(),
        apellido: this.apellido().trim(),
        correo: this.correo().trim(),
        telefono: this.telefono().trim() || undefined,
        username: this.username().trim(),
        clave: this.clave(),
      });
      const url = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
      await this.router.navigateByUrl(url.startsWith('/tabs') ? url : '/tabs/menu', { replaceUrl: true });
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo crear la cuenta.'));
    } finally {
      this.cargando.set(false);
    }
  }
}
