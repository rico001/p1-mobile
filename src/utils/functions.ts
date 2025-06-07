/**
 * Generiert eine zufällige Client-ID mit festem Präfix.
 * @param length Anzahl der zufälligen Zeichen, die zur ID hinzugefügt werden. Default: 16
 * @returns Ein String wie "HTPP-2-MQTT_AND_FTP__xYz123AB…"
 */
export function generateClientId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'HTPP-2-MQTT_AND_FTP__';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    id += chars.charAt(randomIndex);
  }
  return id;
}

/**
 * Einfache Verzögerung per Promise.
 * @param ms Millisekunden, die gewartet werden sollen.
 * @returns Ein Promise, das nach `ms` aufgelöst wird.
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Formatiert einen Bambu-Fehlercode (dezimal) in das hexadezimale Format "XXXX-XXXX".
 * @param decimalCode Der Fehlercode als Dezimalzahl (z. B. 83902467).
 * @returns Ein String wie "0500-4003" oder leer bei 0.
 */
export const formatBambuErrorCode = (decimalCode: number): string => {
  if (decimalCode === 0) {
    return '';
  }
  const hex = decimalCode
    .toString(16)
    .padStart(8, '0')
    .toUpperCase();
  const part1 = hex.slice(0, 4);
  const part2 = hex.slice(4);
  return `${part1}-${part2}`;
};
