export function roundToOneDecimal(value) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (typeof num !== 'number' || isNaN(num)) {
        return value
    }
    return Math.round(num * 10) / 10;
}