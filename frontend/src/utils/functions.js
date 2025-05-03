export function roundToOneDecimal(value) {
    const num =
        typeof value === 'string'
            ? parseFloat(value.replace(',', '.'))
            : value;

    if (typeof num !== 'number' || isNaN(num)) {
        return String(value);
    }

    if (num === 0) {
        return null;
    }

    return num.toFixed(1);
}