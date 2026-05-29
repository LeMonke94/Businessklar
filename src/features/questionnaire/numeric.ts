/**
 * Helpers for the questionnaire's number inputs.
 *
 * The numeric fields (revenue, expenses, salary, staff counts, Hebesatz) are
 * whole values in the legacy, so we parse to integers and strip anything that
 * is not a digit. That keeps a controlled input from fighting the user (no
 * trailing-dot / re-formatting quirks) while still storing a clean `number`.
 */

// Parse raw input text to a number, or undefined when empty.
function parseNumericInput(raw: string): number | undefined {
    const digits = raw.replace(/[^\d]/g, '');
    return digits === '' ? undefined : Number(digits);
}

// Render a stored number as the input's display string ('' when unset).
function toInputValue(value: number | undefined): string {
    return value === undefined ? '' : String(value);
}


export { parseNumericInput, toInputValue };