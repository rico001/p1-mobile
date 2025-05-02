export async function fetchModels() {
  const response = await fetch('/api/ftp/list-files');
  if (!response.ok) {
    throw new Error(`Liste konnte nicht geladen werden: ${response.statusText}`);
  }
  return response.json();
}

export async function performModelAction({ method, path }) {
  const response = await fetch(path, { method });
  if (!response.ok) {
    throw new Error(`Aktion fehlgeschlagen: ${response.statusText}`);
  }
  return response.json();
}