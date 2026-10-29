import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AlertController, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar,
} from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonNote, IonButton],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Perfil</ion-title></ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list [inset]="true">
        <ion-item><ion-label>Usuario</ion-label><ion-note slot="end">{{ auth.user()?.username }}</ion-note></ion-item>
        <ion-item><ion-label>Correo</ion-label><ion-note slot="end">{{ auth.user()?.correo }}</ion-note></ion-item>
        <ion-item><ion-label>Rol</ion-label><ion-note slot="end">{{ auth.rol() || '—' }}</ion-note></ion-item>
        <ion-item lines="none">
          <ion-label>API<p>{{ api }}</p></ion-label>
        </ion-item>
      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" color="danger" fill="outline" (click)="confirmarSalida()">Cerrar sesión</ion-button>
      </div>
    </ion-content>
  `,
})
export class PerfilPage {
  auth = inject(AuthService);
  private alertas = inject(AlertController);
  api = environment.apiUrl;

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
