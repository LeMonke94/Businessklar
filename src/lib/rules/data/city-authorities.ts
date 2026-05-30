import cityAuthorityMap from './city-authorities.json';
import cityNames from './cities246.json';


/**
 * Per-city competent-authority data, copied verbatim from the legacy generated
 * CITY_AUTHORITY_MAP (scripts/build-city-authorities.cjs). For each city it
 * holds the responsible IHK, Handwerkskammer (HWK) and Gewerbe/services portal,
 * with the official URL, German label and an `exact` flag (true = the specific
 * regional body; false = a nationwide fallback portal).
 *
 * The data lives in city-authorities.json so it stays a pure copy; this module
 * types it and exposes the lookup.
 */

type AuthorityRef = {
    key: string;
    url: string;
    label_de: string;
    // true: the specific regional body for this city; false: a nationwide
    // fallback portal (e.g. service-bund.de for the Gewerbe slot).
    exact: boolean;
};

type CityAuthority = {
    ihk: AuthorityRef;
    hwk: AuthorityRef;
    gewerbe: AuthorityRef;
};

const authorityByName = cityAuthorityMap as Record<string, CityAuthority>;

// Exact lookup by (trimmed) city name — same key space as cities246.json.
function findCityAuthority(name: string): CityAuthority | undefined {
    return authorityByName[name.trim()];
}

// Dev sanity check: any city name without an authority entry — same guard style
// as the Bundesland/Hebesatz maps. No-op in production.
if (process.env.NODE_ENV !== 'production') {
    const missing = (cityNames as string[]).filter((name) => !(name in authorityByName));
    if (missing.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`[city-authorities] No authority entry for ${missing.length} city/cities:`, missing);
    }
}


export { findCityAuthority };
export type { AuthorityRef, CityAuthority };