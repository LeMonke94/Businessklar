/**
 * Currency formatting for the report. Mirrors the legacy `fmt()`: round to a
 * whole euro, group thousands for the active locale, use a real minus sign for
 * negatives, and suffix " EUR".
 */
function formatEuro(value: number, locale: string): string {
    const rounded = Math.round(value);
    const sign = rounded < 0 ? '\u2212' : ''; // U+2212 minus
    const grouped = new Intl.NumberFormat(locale).format(Math.abs(rounded));
    return `${sign}${grouped} EUR`;
}


export { formatEuro };