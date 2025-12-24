export async function fetchModels(currentPath = '/p1-app-models') {
  const response = await fetch(`/api/ftp/list-files?path=${encodeURIComponent(currentPath)}`);
  if (!response.ok) {
    throw new Error(`Liste konnte nicht geladen werden: ${response.statusText}`);
  }
  return response.json();
}

export async function performModelAction({ method, path, query = '' }) {
  const response = await fetch(path + query, { method });
  if (!response.ok) {
    throw new Error(`Aktion fehlgeschlagen: ${response.statusText}`);
  }
  return response.json();
}

export async function createFolder({ folderName, parentPath = '/p1-app-models' }) {
  const response = await fetch('/api/ftp/create-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderName, parentPath })
  });
  if (!response.ok) {
    throw new Error(`Ordner konnte nicht erstellt werden: ${response.statusText}`);
  }
  return response.json();
}

export async function moveItem({ sourcePath, targetFolder }) {
  const response = await fetch('/api/ftp/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourcePath, targetFolder })
  });
  if (!response.ok) {
    throw new Error(`Verschieben fehlgeschlagen: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteFolder(path) {
  const response = await fetch(`/api/ftp/delete-folder?path=${encodeURIComponent(path)}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Löschen fehlgeschlagen: ${response.statusText}`);
  }
  return response.json();
}