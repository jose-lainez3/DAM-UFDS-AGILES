import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { OTA_BUILD_SHA, OTA_NATIVE_CHANNEL } from './ota-build';

interface OtaManifest {
  version: string;
  sha: string;
  channel: string;
  url: string;
  sha256: string;
}

const REPOSITORY = 'jose-lainez3/DAM-UFDS-AGILES';
const OTA_BASE_URL = `https://raw.githubusercontent.com/${REPOSITORY}/foodorder-ota`;
const MANIFEST_URL = `${OTA_BASE_URL}/latest.json`;

/**
 * Actualiza exclusivamente el bundle web (Angular, CSS, HTML).
 * Cambios en plugins, permisos o Android requieren un APK firmado nuevo.
 * Fallos de red no impiden usar la aplicación instalada.
 */
@Injectable({ providedIn: 'root' })
export class FoodOrderUpdateService {
  private checking = false;

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Importante: confirma cada arranque o el plugin revierte un OTA anterior.
      await CapacitorUpdater.notifyAppReady();
    } catch (error) {
      console.warn('[FoodOrder OTA] No se pudo confirmar el inicio:', error);
      return;
    }

    void this.checkForUpdates();
  }

  private async checkForUpdates(): Promise<void> {
    if (this.checking) return;
    this.checking = true;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 12000);

    try {
      const response = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, {
        cache: 'no-store',
        signal: abort.signal,
      });
      if (!response.ok) return;

      const manifest: unknown = await response.json();
      if (!this.validManifest(manifest)) return;

      // Evita descargar nuevamente el bundle ya incluido en el APK o el OTA activo.
      if (manifest.sha === OTA_BUILD_SHA) return;
      const current = await CapacitorUpdater.current();
      if (current.bundle?.version === manifest.version) return;

      console.info('[FoodOrder OTA] Nueva versión web:', manifest.version);
      const bundle = await CapacitorUpdater.download({
        url: manifest.url,
        version: manifest.version,
        checksum: manifest.sha256,
      });
      // Solo se reinicia el WebView, no se reinstala Android.
      await CapacitorUpdater.set({ id: bundle.id });
      await CapacitorUpdater.reload();
    } catch (error) {
      // La falta de internet o un bundle inválido no debe impedir hacer pedidos.
      console.warn('[FoodOrder OTA] Se conserva la versión instalada:', error);
    } finally {
      clearTimeout(timeout);
      this.checking = false;
    }
  }

  private validManifest(value: unknown): value is OtaManifest {
    if (!value || typeof value !== 'object') return false;
    const m = value as Partial<OtaManifest>;
    return (
      m.channel === OTA_NATIVE_CHANNEL &&
      typeof m.version === 'string' &&
      /^1\.0\.\d+$/.test(m.version) &&
      typeof m.sha === 'string' &&
      /^[a-f0-9]{40}$/.test(m.sha) &&
      typeof m.sha256 === 'string' &&
      /^[a-f0-9]{64}$/.test(m.sha256) &&
      typeof m.url === 'string' &&
      m.url === `${OTA_BASE_URL}/bundles/${m.sha}.zip`
    );
  }
}
