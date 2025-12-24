import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export async function fetchModels(currentPath = '/p1-app-models') {
  try {
    const response = await fetchWithTimeout(`/api/ftp/list-files?path=${encodeURIComponent(currentPath)}`);
    if (!response.ok) {
      throw new Error(`Liste konnte nicht geladen werden: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Models API] Fehler beim Laden:', error);
    throw error;
  }
}

export async function performModelAction({ method, path, query = '' }) {
  try {
    const response = await fetchWithTimeout(path + query, { method });
    if (!response.ok) {
      throw new Error(`Aktion fehlgeschlagen: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Models API] Fehler bei Aktion:', error);
    throw error;
  }
}

export async function createFolder({ folderName, parentPath = '/p1-app-models' }) {
  try {
    const response = await fetchWithTimeout('/api/ftp/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderName, parentPath })
    });
    if (!response.ok) {
      throw new Error(`Ordner konnte nicht erstellt werden: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Models API] Fehler beim Erstellen:', error);
    throw error;
  }
}

export async function moveItem({ sourcePath, targetFolder }) {
  try {
    const response = await fetchWithTimeout('/api/ftp/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourcePath, targetFolder })
    });
    if (!response.ok) {
      throw new Error(`Verschieben fehlgeschlagen: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Models API] Fehler beim Verschieben:', error);
    throw error;
  }
}

export async function deleteFolder(path) {
  try {
    const response = await fetchWithTimeout(`/api/ftp/delete-folder?path=${encodeURIComponent(path)}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Löschen fehlgeschlagen: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Models API] Fehler beim Löschen:', error);
    throw error;
  }
}

export async function renameFolder({ path, newName }) {
  try {
    const response = await fetchWithTimeout(`/api/ftp/rename-folder?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Umbenennen fehlgeschlagen: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[Models API] Fehler beim Umbenennen:', error);
    throw error;
  }
}