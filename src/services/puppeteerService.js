import puppeteer from 'puppeteer';
import { config } from '../config'; // Erwartet eine Konfigurationsstruktur mit config.puppeteer

class PuppeteerService {
  constructor(
    // Entire puppeteerConfig defaulting to config.puppeteer
    puppeteerConfig = config.puppeteer || {}
  ) {
    this.browser = null;

    // Destructure mit Default-Werten
    const {
      headless = true,
      args = []
    } = puppeteerConfig;

    this.defaultOptions = {
      headless,
      args: [ ...args],
    };
  }

  /**
   * Browser starten (Singleton) — kann mit Optionen überschrieben werden
   */
  async init(options = {}) {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        ...this.defaultOptions,
        ...options,
      });
    }
    return this.browser;
  }

  /**
   * Browser wieder schließen
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Neue Seite mit optionalen Viewport- und Header-Settings
   */
  async newPage({ viewport = { width: 1280, height: 800 }, extraHTTPHeaders = {} } = {}) {
    if (!this.browser) {
      await this.init();
    }
    const page = await this.browser.newPage();
    await page.setViewport(viewport);
    if (Object.keys(extraHTTPHeaders).length) {
      await page.setExtraHTTPHeaders(extraHTTPHeaders);
    }
    return page;
  }

  /**
   * Screenshot von URL
   */
  async screenshot(url, { fullPage = true, pageOptions = {}, screenshotOptions = {} } = {}) {
    const page = await this.newPage(pageOptions);
    await page.goto(url, { waitUntil: 'networkidle2' });
    const buffer = await page.screenshot({
      fullPage,
      ...screenshotOptions,
    });
    await page.close();
    return buffer;
  }

  /**
   * PDF-Generierung von URL
   */
  async pdf(url, { format = 'A4', printBackground = true, pageOptions = {}, pdfOptions = {} } = {}) {
    const page = await this.newPage(pageOptions);
    await page.goto(url, { waitUntil: 'networkidle2' });
    const buffer = await page.pdf({
      format,
      printBackground,
      ...pdfOptions,
    });
    await page.close();
    return buffer;
  }

  /**
   * Funktion auf der Seite ausführen
   */
  async evaluate(url, pageFunction, args = [], { pageOptions = {} } = {}) {
    const page = await this.newPage(pageOptions);
    await page.goto(url, { waitUntil: 'networkidle2' });
    const result = await page.evaluate(pageFunction, ...args);
    await page.close();
    return result;
  }
}

// Singleton-Export
export default new PuppeteerService();
