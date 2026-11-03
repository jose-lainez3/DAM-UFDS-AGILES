import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../core/auth.service';
import { nombreCompleto } from '../../core/models';

@Component({
  selector: 'app-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonNote, IonButton],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Perfil</ion-title></ion-toolbar>
    </ion-header>

    <ion-content>
      @if (auth.isLoggedIn()) {
        <ion-list [inset]="true">
          @if (auth.user()?.cliente; as c) {
            <ion-item><ion-label>Nombre</ion-label><ion-note slot="end">{{ nombre(c) }}</ion-note></ion-item>
          }
          <ion-item><ion-label>Usuario</ion-label><ion-note slot="end">{{ auth.user()?.username }}</ion-note></ion-item>
          <ion-item lines="none"><ion-label>Correo</ion-label><ion-note slot="end">{{ auth.user()?.correo }}</ion-note></ion-item>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" color="danger" fill="outline" (click)="confirmarSalida()">Cerrar sesión</ion-button>
        </div>
      } @else {
        <div class="invitado">
          <div class="invitado__logo">🍽️</div>
          <h2>Bienvenido a FoodOrder</h2>
          <p>Inicia sesión o crea una cuenta para hacer pedidos y ver tu historial.</p>
          <ion-button expand="block" (click)="ir('/login')">Iniciar sesión</ion-button>
          <ion-button expand="block" fill="outline" (click)="ir('/registro')">Crear cuenta</ion-button>
        </div>
      }
    </ion-content>
  `,
  styles: `
    .invitado { max-width: 420px; margin: 0 auto; padding: 48px 24px; text-align: center; }
    .invitado__logo { font-size: 56px; }
    .invitado p { color: var(--ion-color-medium); margin-bottom: 24px; }
    .invitado ion-button { margin-top: 8px; }
  `,
})
export class PerfilPage {
  auth = inject(AuthService);
  private alertas = inject(AlertController);
  private router = inject(Router);
  nombre = nombreCompleto;

  ir(ruta: string) {
    this.router.navigate([ruta], { queryParams: { returnUrl: '/tabs/perfil' } });
  }

  async confirmarSalida() {
    const alerta = await this.alertas.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar la sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'destructive', handler: () => this.auth.logout() },
      ],
    });
    await alerta.present();
  }
}
