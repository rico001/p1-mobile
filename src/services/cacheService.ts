import fs from 'fs';
import path from 'path';

class CacheService {
  /**
   * Check if caching is enabled via environment variable
   */
  isEnabled(): boolean {
    return process.env.CACHE_MODELS_ENABLED === 'true';
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
