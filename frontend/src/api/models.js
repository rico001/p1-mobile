export async function fetchModels() {
  const response = await fetch('/api/ftp/list-files');
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