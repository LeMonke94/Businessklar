import type { BundeslandCode } from '@/features/questionnaire/types';
import cityNames from './cities246.json';
import cityBundeslandMap from './city-bundesland.json';


/**
 * City reference data for the questionnaire.
 *
 * Composed from two copied legacy files:
 * - cities246.json        — the list of city names (authoritative, 246 cities)
 * - city-bundesland.json  — name -> Bundesland code (legacy CITY_TO_BL)
 *
 * The per-city Gewerbesteuer-Hebesatz is intentionally NOT here yet; it is only
 * needed for the report (Phase 9.5). Until then the legacy nationwide fallback
 * (400 %) applies to every city.
 */

// Trade-tax multiplier used when a city has no specific value (legacy default).
const FALLBACK_HEBESATZ = 400;

const BUNDESLAND_CODES: readonly BundeslandCode[] = [
    'BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV',
    'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH',
];

function isBundeslandCode(value: string): value is BundeslandCode {
    return (BUNDESLAND_CODES as readonly string[]).includes(value);
}

type City = {
    name: string;
    // Optional: a city missing from the mapping still appears in search, it just
    // resolves to no Bundesland (graceful, rather than disappearing).
    bundesland?: BundeslandCode;
};

const bundeslandByName = cityBundeslandMap as Record<string, string>;

// Build the typed list. Names drive the list; the Bundesland is attached when a
// valid mapping exists.
const cities: City[] = (cityNames as string[]).map((name) => {
    const code = bundeslandByName[name];
    return {
        name,
        bundesland: code && isBundeslandCode(code) ? code : undefined,
    };
});

// Dev sanity check: report any city without a valid Bundesland mapping — the
// same guard the legacy build script enforced. No-op in production.
if (process.env.NODE_ENV !== 'production') {
    const missing = cities.filter((city) => city.bundesland === undefined).map((city) => city.name);
    if (missing.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`[cities] No Bundesland mapping for ${missing.length} city/cities:`, missing);
    }
}

// Exact lookup by (trimmed) name.
function findCity(name: string): City | undefined {
    const trimmed = name.trim();
    return cities.find((city) => city.name === trimmed);
}

// Case-insensitive substring search for the autocomplete; capped like legacy.
function searchCities(query: string, limit = 8): City[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
        return [];
    }
    return cities.filter((city) => city.name.toLowerCase().includes(q)).slice(0, limit);
}


export { cities, findCity, searchCities, isBundeslandCode, FALLBACK_HEBESATZ };
export type { City };