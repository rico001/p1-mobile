import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export async function fetchTimelapses() {
  try {
    const response = await fetchWithTimeout('/api/ftp/list-files?path=/timelapse&type=avi');
    if (!response.ok) {
      throw new Error(`Timelapse-Liste konnte nicht geladen werden: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Timelapse API] Fehler beim Laden:', error);
    throw error;
  }
}

export async function deleteTimelapse(path) {
  try {
    const response = await fetchWithTimeout(`/api/ftp/delete-file?path=${encodeURIComponent(path)}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Löschen fehlgeschlagen: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Timelapse API] Fehler beim Löschen:', error);
    throw error;
  }
}
