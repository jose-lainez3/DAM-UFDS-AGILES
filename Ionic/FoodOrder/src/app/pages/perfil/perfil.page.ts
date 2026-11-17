import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../core/auth.service';
import { nombreCompleto } from '../../core/models';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { OTA_BUILD_SHA } from '../../core/ota-build';

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
          <img src="assets/logo.png" alt="Logo de FoodOrder" class="invitado__logo" />
          <h2>Bienvenido a FoodOrder</h2>
          <p>Inicia sesión o crea una cuenta para hacer pedidos y ver tu historial.</p>
          <ion-button expand="block" (click)="ir('/login')">Iniciar sesión</ion-button>
          <ion-button expand="block" fill="outline" (click)="ir('/registro')">Crear cuenta</ion-button>
        </div>
      }

      <section class="version-panel" aria-label="Versión instalada de FoodOrder">
        <div class="version-panel__header">
          <div>
            <span class="version-panel__eyebrow">ACERCA DE LA APLICACIÓN</span>
            <h2>Versión de FoodOrder</h2>
          </div>
          <span class="version-panel__number">{{ versionInstalada() }}</span>
        </div>
        <p>{{ origenVersion() }}</p>
        <small>Revisión: {{ revisionWeb }}</small>
      </section>
    </ion-content>
  `,
  styles: `
    .invitado { max-width: 420px; margin: 0 auto; padding: 48px 24px; text-align: center; }
    .invitado__logo { display: block; width: 115px; height: 115px; max-width: 100%; object-fit: contain; margin: 0 auto; }
    .invitado p { color: var(--ion-color-medium); margin-bottom: 24px; }
    .invitado ion-button { margin-top: 8px; }
    .version-panel {
      max-width: 540px;
      margin: 24px 16px 28px;
      padding: 17px 18px;
      border: 1px solid #e5e9e6;
      border-radius: 16px;
      background: #ffffff;
    }
    .version-panel__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .version-panel__eyebrow {
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .version-panel h2 {
      margin: 6px 0 0;
      color: #10372f;
      font-size: 16px;
      font-weight: 750;
    }
    .version-panel__number {
      display: inline-block;
      padding: 7px 10px;
      border-radius: 9px;
      background: #e6eee9;
      color: #10372f;
      font-size: 13px;
      font-weight: 700;
    }
    .version-panel p {
      margin: 12px 0 6px;
      color: #64748b;
      font-size: 13px;
    }
    .version-panel small {
      color: #718178;
      font-size: 11px;
    }
  `,
})
export class PerfilPage {
  auth = inject(AuthService);
  private alertas = inject(AlertController);
  private router = inject(Router);
  nombre = nombreCompleto;

  readonly versionInstalada = signal('Consultando…');
  readonly origenVersion = signal('Comprobando actualización');
  readonly revisionWeb = OTA_BUILD_SHA === 'local' ? 'desarrollo' : OTA_BUILD_SHA.slice(0, 7);

  ionViewWillEnter(): void {
    void this.consultarVersionInstalada();
  }

  private async consultarVersionInstalada(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.versionInstalada.set('Web');
      this.origenVersion.set('Versión ejecutándose en el navegador');
      return;
    }

    try {
      const app = await App.getInfo();
      this.versionInstalada.set(`v${app.version}`);
      this.origenVersion.set('Versión incluida en el APK');
    } catch {
      this.versionInstalada.set('Sin datos');
      this.origenVersion.set('No se pudo consultar la versión del APK');
    }

    try {
      const estado = await CapacitorUpdater.current();
      const versionOTA = estado.bundle?.version;
      if (typeof versionOTA === 'string' && /^\d+\.\d+\.\d+$/.test(versionOTA)) {
        this.versionInstalada.set(`v${versionOTA}`);
        this.origenVersion.set('Actualización OTA instalada');
      }
    } catch {
      // Si el actualizador falla, se conserva la versión nativa conocida.
    }
  }

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
