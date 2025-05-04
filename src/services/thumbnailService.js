import puppeteer from 'puppeteer';
import { config } from '../config/index.js'; // Stelle sicher, dass config/index.js existiert und export const config enthält
import AdmZip from 'adm-zip'; // Stelle sicher, dass adm-zip installiert ist
import path from 'path';
import fs from 'fs';
import { delay } from '../utils/functions.js';

class ThumbnailService {
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

    //erstelle den thumbnail Ordner, falls er nicht existiert
    const thumbnailDir = path.resolve(process.cwd(), 'thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
  }

  /**
   * Lädt eine lokale 3MF-Datei auf imagetostl.com hoch und erstellt einen Screenshot des gerenderten Modells.
   * Öffnet für jede Datei einen neuen Browser-Context, damit keine Sessions hängen bleiben.
   * @param {string} filePath - Lokaler Pfad zur .3mf-Datei
   * @param {{ width?: number, height?: number, fullPage?: boolean, timeoutMs?: number }} options
   * @param {string} viewerUrl - URL der Viewer-Seite
   * @returns {Promise<Buffer>} Puffer des Screenshots
   */
  async __extractThumbnailWithImage2Stl(
    filePath,
    { width = 768, height = 768, fullPage = false, timeoutMs = 500000 } = {}
  ) {
    const viewerUrl = 'https://imagetostl.com/de/3mf-online-ansehen'
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
      // 2mal klicken: <span id="sr" class="x" title="Hineinzoomen"><img src="/c/i/vzin.png"></span>
      const zoomInButton = await page.$('#sr');
      if (zoomInButton) {
        await zoomInButton.click();
        await delay(1000); // Warte 1 Sekunde
        //await zoomInButton.click();
        //await delay(1000); // Warte 1 Sekunde
      }
      // 1 mal klicken: <span id="jl" class="x cj" title="Ganzer Bildschirm"><img src="/c/i/vmax.png"></span>
      const fullScreenButton = await page.$('#jl');
      if (fullScreenButton) {
        await fullScreenButton.click();
        //await delay(1000); // Warte 1 Sekunde
      }
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

      await page.addStyleTag({
        content: `
          /* Erst mal alles unsichtbar machen */
          body * {
            visibility: hidden !important;
            background: #292929 !important;
          }
          ins {
            display: none !important;
          }
          /* und nur dein Canvas wieder sichtbar machen */
          canvas#oea {
            visibility: visible !important;
            /* damit es oben liegt */
            position: relative !important;
            z-index: 9999 !important;
          }
        `
      });

      await delay(1000); // Warte 1 Sekunde
      const buffer = await canvas.screenshot({ type: 'png' });
      return buffer;

    } finally {
      // Cleanup: Seite und Browser immer schließen
      if (page) await page.close().catch(() => { });
      if (browser) await browser.close().catch(() => { });
    }
  }

  async __extractThumbnailFrom3mf(filePath) {
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    console.log("--------- 3mf Inhalte ---------");
    const thumbnailEntry = zipEntries.find(entry => {
      console.log(entry.entryName)
      return entry.entryName.toLowerCase().endsWith('.png');
    });
    console.log("--------- Ende 3mf Inhalte ---------");
    
    if (thumbnailEntry) {
      const thumbnailBuffer = thumbnailEntry.getData(); // Buffer direkt zurückgeben
      return thumbnailBuffer;
    }
    return null;
  }

  async extractThumbnail(filelocalPath, thumbnailPath) {

    let buffer;
    try {
      buffer = await this.__extractThumbnailFrom3mf(filelocalPath);
      if (buffer) {
        await fs.promises.writeFile(thumbnailPath, buffer);
      }
      if (!buffer) {
        this.__extractThumbnailWithImage2Stl(filelocalPath).then((buffer) => {
          if (buffer) {
            console.log("Thumbnail von imagetostl.com erstellt");
            fs.promises.writeFile(thumbnailPath, buffer).then(() => {
              console.log("Thumbnail gespeichert");
            }).catch((error) => {
              console.error("Fehler beim Speichern des Thumbnails:", error);
            });
          } else {
            console.log("Thumbnail konnte nicht erstellt werden");
          }
        }
        ).catch((error) => {
          console.error("Fehler beim Erstellen des Thumbnails:", error);
        });
      }
    } catch (error) {
      console.error(`Fehler beim Generieren des Thumbnails für ${filelocalPath}`, error);
    }
  }

  async deleteThumbnail(thumbnailPath) {
    try {
      await fs.promises.unlink(thumbnailPath);
      console.log(`Thumbnail ${thumbnailPath} gelöscht.`);
    } catch (error) {
      console.error(`Fehler beim Löschen des Thumbnails ${thumbnailPath}:`, error);
    }
  }

}

// Singleton-Export: die Konfiguration bleibt, aber Browser-Instanzen fresh
export default new ThumbnailService();
