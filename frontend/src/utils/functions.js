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

//generic confirm dialog
export function confirmDialog(message){
    return window.confirm(message) ? true : false;
}


export function objectToQueryString(obj, prefix = '&') {
    return Object.keys(obj)
        .map((key) => {
            const value = obj[key];
            const encodedKey = encodeURIComponent(key);
            const encodedValue =
                typeof value === 'object'
                    ? objectToQueryString(value, `${prefix}${encodedKey}.`)
                    : `${prefix}${encodedKey}=${encodeURIComponent(value)}`;
            return encodedValue;
        })
        .join('');
}