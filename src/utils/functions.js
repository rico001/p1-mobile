export function generateClientId(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'HTPP-2-MQTT_AND_FTP__';
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//https://wiki.bambulab.com/en/hms/error-code z.b.: 83902467 -> "0500-4003"
export const formatBambuErrorCode = (decimalCode) => {
    if(decimalCode === 0) {
        return '';
    }
    const hex = decimalCode.toString(16).padStart(8, '0').toUpperCase();
    const part1 = hex.slice(0, 4);
    const part2 = hex.slice(4);
    return `${part1}-${part2}`;
}

