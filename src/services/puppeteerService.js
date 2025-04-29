import puppeteer from 'puppeteer';
import { config } from '../config/index.js'; // Stelle sicher, dass config/index.js existiert und export const config enthält

class PuppeteerService {
  constructor(
    puppeteerConfig = config.puppeteer || {}
  ) {
    // Default Puppeteer-Config aus deinem config-Modul
    const { headless = true, args = [] } = puppeteerConfig;
    const defaultArgs = ['--no-sandbox', '--disable-setuid-sandbox'];

    this.launchOptions = {
      headless,
      args: [...defaultArgs, ...args],
    };
  }

  /**
   * Lädt eine lokale 3MF-Datei auf imagetostl.com hoch und erstellt einen Screenshot des gerenderten Modells.
   * Öffnet für jede Datei einen neuen Browser-Context, damit keine Sessions hängen bleiben.
   * @param {string} filePath - Lokaler Pfad zur .3mf-Datei
   * @param {{ width?: number, height?: number, fullPage?: boolean, timeoutMs?: number }} options
   * @param {string} viewerUrl - URL der Viewer-Seite
   * @returns {Promise<Buffer>} Puffer des Screenshots
   */
  async screenshot3mf(
    filePath,
    { width = 1024, height = 768, fullPage = false, timeoutMs = 120000 } = {},
    viewerUrl = 'https://imagetostl.com/de/3mf-online-ansehen'
  ) {
    let browser;
    let page;
    try {
      // Frischen Browser starten
      browser = await puppeteer.launch(this.launchOptions);
      page = await browser.newPage();
      await page.setViewport({ width, height });

      // Viewer-Seite laden
      await page.goto(viewerUrl, { waitUntil: 'networkidle2', timeout: timeoutMs });

      // Consent-Dialog klicken, falls vorhanden
      try {
        const consentBtn = await page.waitForSelector('button[aria-label="Einwilligen"]', { timeout: timeoutMs });
        if (consentBtn) await consentBtn.click();
      } catch {
        // kein Consent nötig
      }

      // Datei per Input hochladen
      const fileInput = await page.waitForSelector('input[type=file]', { timeout: timeoutMs });
      await fileInput.uploadFile(filePath);

      await page.waitForSelector('canvas#oea', { timeout: timeoutMs });
      // Sicherstellen, dass Canvas geladen ist (Größe > 0)
      await page.waitForFunction(() => {
        const c = document.querySelector('canvas#oea');
        return c && c.width > 0 && c.height > 0;
      }, { timeout: timeoutMs });

      // Nur Canvas-Element screenshot
      // get element with class name "lg" und display none
      const lgElement = await page.$('.lg');
      if (lgElement) {
        await page.evaluate(el => el.style.display = 'none', lgElement);
      }
      // same with gf class name
      const gfElement = await page.$('.gf');
      if (gfElement) {
        await page.evaluate(el => el.style.display = 'none', gfElement);
      }
      // Screenshot des Canvas-Elements erstellen 
      const canvas = await page.$('canvas#oea');
      if (!canvas) throw new Error('Canvas element not found');
      const buffer = await canvas.screenshot({ type: 'png' });
      return buffer;

    } finally {
      // Cleanup: Seite und Browser immer schließen
      if (page) await page.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    }
  }
}

// Singleton-Export: die Konfiguration bleibt, aber Browser-Instanzen fresh
export default new PuppeteerService();
