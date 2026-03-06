import fs from 'fs';
import path from 'path';

class CacheService {
  private readonly cleanupInterval = 24 * 60 * 60 * 1000; // Run cleanup every 24 hours
  private cleanupTimer?: NodeJS.Timeout;

  /**
   * Get max cache age from environment variable (in days), defaults to 7 days
   */
  private getMaxCacheAge(): number {
    const days = parseInt(process.env.CACHE_MAX_AGE_DAYS || '7', 10);
    return days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  }

  constructor() {
    // Start cleanup job if caching is enabled
    if (this.isEnabled()) {
      this.startCleanupJob();
    }
  }

  /**
   * Check if caching is enabled via environment variable
   */
  isEnabled(): boolean {
    return process.env.CACHE_MODELS_ENABLED !== 'false';
  }

  /**
   * Start the automatic cleanup job
   */
  private startCleanupJob(): void {
    // Run cleanup immediately on startup
    this.cleanupOldFiles();

    // Schedule regular cleanup
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldFiles();
    }, this.cleanupInterval);

    const maxAgeDays = parseInt(process.env.CACHE_MAX_AGE_DAYS || '7', 10);
    console.log(`Cache cleanup job gestartet (läuft alle 24 Stunden, löscht Dateien älter als ${maxAgeDays} Tage)`);
  }

  /**
   * Stop the cleanup job
   */
  stopCleanupJob(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
      console.log('Cache cleanup job gestoppt');
    }
  }

  /**
   * Clean up files older than maxCacheAge (7 days)
   */
  cleanupOldFiles(): void {
    const filesDir = path.resolve(process.cwd(), 'files');

    try {
      if (!fs.existsSync(filesDir)) {
        return;
      }

      const files = fs.readdirSync(filesDir);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(filesDir, file);

        try {
          const stats = fs.statSync(filePath);

          // Skip directories
          if (stats.isDirectory()) {
            continue;
          }

          const fileAge = Date.now() - stats.mtimeMs;
          const maxCacheAge = this.getMaxCacheAge();

          if (fileAge > maxCacheAge) {
            const ageInDays = Math.floor(fileAge / (24 * 60 * 60 * 1000));
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`Cache-Datei gelöscht (${ageInDays} Tage alt):`, file);
          }
        } catch (err) {
          console.warn(`Fehler beim Verarbeiten der Datei ${file}:`, err);
        }
      }

      if (deletedCount > 0) {
        console.log(`Cache cleanup abgeschlossen: ${deletedCount} alte Datei(en) gelöscht`);
      }
    } catch (err) {
      console.warn('Fehler beim Cache cleanup:', err);
    }
  }

  /**
   * Delete a cached file from the files directory
   */
  deleteCachedFile(fileName: string): void {
    const cachedFilePath = path.resolve(process.cwd(), 'files', fileName);
    try {
      if (fs.existsSync(cachedFilePath)) {
        fs.unlinkSync(cachedFilePath);
        console.log('Gecachte Datei gelöscht:', cachedFilePath);
      }
    } catch (err) {
      console.warn('Konnte gecachte Datei nicht löschen:', err);
    }
  }

  /**
   * Rename a cached file in the files directory
   */
  renameCachedFile(oldFileName: string, newFileName: string): void {
    const oldPath = path.resolve(process.cwd(), 'files', oldFileName);
    const newPath = path.resolve(process.cwd(), 'files', newFileName);
    try {
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log('Gecachte Datei umbenannt:', oldPath, '->', newPath);
      }
    } catch (err) {
      console.warn('Konnte gecachte Datei nicht umbenennen:', err);
    }
  }
}

export const cacheService = new CacheService();
