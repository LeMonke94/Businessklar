import type { BundeslandCode } from '@/features/questionnaire/types';
import cityNames from './cities246.json';
import cityBundeslandMap from './city-bundesland.json';
import { cityHebesatzList } from './city-hebesatz';


/**
 * City reference data for the questionnaire and report.
 *
 * Composed from three copied legacy sources:
 * - cities246.json        — the list of city names (authoritative, 246 cities)
 * - city-bundesland.json  — name -> Bundesland code (legacy CITY_TO_BL)
 * - city-hebesatz.ts      — name -> Gewerbesteuer-Hebesatz (legacy CITIES array)
 *
 * A city missing from a mapping degrades gracefully: it still appears in search,
 * resolves to no Bundesland, and uses the nationwide Hebesatz fallback (400 %).
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
    // Gewerbesteuer multiplier (%). Falls back to the nationwide average when the
    // city is not in the Hebesatz list.
    hebesatz: number;
};

const bundeslandByName = cityBundeslandMap as Record<string, string>;
const hebesatzByName = new Map(cityHebesatzList.map((entry) => [entry.n, entry.hb] as const));

// Build the typed list. Names drive the list; Bundesland and Hebesatz are
// attached when a mapping exists, otherwise they degrade to undefined / fallback.
const cities: City[] = (cityNames as string[]).map((name) => {
    const code = bundeslandByName[name];
    return {
        name,
        bundesland: code && isBundeslandCode(code) ? code : undefined,
        hebesatz: hebesatzByName.get(name) ?? FALLBACK_HEBESATZ,
    };
});

// Dev sanity checks: report cities without a Bundesland or Hebesatz mapping — the
// same guards the legacy build enforced. No-op in production.
if (process.env.NODE_ENV !== 'production') {
    const missingBundesland = cities.filter((city) => city.bundesland === undefined).map((city) => city.name);
    if (missingBundesland.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`[cities] No Bundesland mapping for ${missingBundesland.length} city/cities:`, missingBundesland);
    }
    const missingHebesatz = (cityNames as string[]).filter((name) => !hebesatzByName.has(name));
    if (missingHebesatz.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
            `[cities] No Hebesatz for ${missingHebesatz.length} city/cities (using ${FALLBACK_HEBESATZ} %):`,
            missingHebesatz,
        );
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