import type { BundeslandCode } from '@/features/questionnaire/types';
import type { ComplianceRule, ComplianceSeverity } from './compliance-engine';
import { findCityAuthority, type CityAuthority } from './data/city-authorities';


/**
 * Authority resolver — for each matched compliance rule, work out which
 * official body is responsible and which link to show. Ports the legacy
 * resolveAuthorities (compliance-rules.js) verbatim in behaviour, with two
 * deliberate implementation changes:
 *
 *  1. Language-neutral. The legacy baked the current UI language into the
 *     output (link notes, portal labels, the "authority — Bundesland" line).
 *     Here the resolver returns only *keys* (noteKey, portalKey, the German
 *     chamber label, the rule key, the Bundesland code); the view layer
 *     resolves them to text via next-intl. That keeps lib free of i18n.
 *  2. Pure + synchronous. This is a total derivation over data that is already
 *     in memory (the matched rules + the city authority map), so there is no
 *     failure mode and no I/O — no Result/Promise wrapper needed, unlike the
 *     engines which may become Supabase-backed.
 *
 * Pure: no React, no DOM, no Supabase, no i18n.
 */

/**
 * Official nationwide sources, verbatim from the legacy OFFICIAL_FALLBACKS.
 * Used when no city-specific body is available, and as link_override targets.
 */
const OFFICIAL_FALLBACKS = {
    ihkOrganisationFinder: 'https://www.ihk.de/ueber-uns/organisation/ihk-organisationfinder-3183308',
    handwerkZdh: 'https://www.handwerk.de/',
    anerkennungInDeutschland: 'https://www.anerkennung-in-deutschland.de/',
    bafinVersicherungsvermittler: 'https://www.bafin.de/DE/Aufsicht/Intermediaries/Versicherungsvermittler/versicherungsvermittler_node.html',
    bafin34f: 'https://www.bafin.de/DE/Aufsicht/Intermediaries/Finanzanlagenvermittler/finanzanlagenvermittler_node.html',
    gewo: 'https://www.gesetze-im-internet.de/gewo/',
    ihkBayern: 'https://www.ihk.de/bayern',
    serviceBund: 'https://www.service-bund.de/Service/DE/Home/home_node.html',
    zollGewerbe: 'https://www.zoll.de/DE/Fachthemen/Verbrauchsteuern/Gaststaettenerlaubnis/gaststaettenerlaubnis_node.html',
} as const;

type OfficialFallbackKey = keyof typeof OFFICIAL_FALLBACKS;

// i18n note keys under compliance.note.* — language-neutral.
type AuthorityNoteKey =
    | 'linkOverride'
    | 'hwkExact' | 'hwkFb'
    | 'ihkExact' | 'ihkFb'
    | 'gewExact' | 'gewFb'
    | 'anerk'
    | 'taxiExact' | 'taxiFb'
    | 'ordExact' | 'ordFb'
    | 'defExact' | 'defFb';

type HandwerkNoteKey = 'handA' | 'handB';
type RecognitionNoteKey = 'recogAn' | 'recogGen';

// How the link was chosen — mirrors the legacy `mapping` field.
type AuthorityMapping = 'override' | 'city_pack' | 'anerkennung' | 'fallback';

type ResolvedAuthority = {
    // Identifies the rule; the view reads compliance.ruleText.<ruleKey>.* (incl.
    // the `authority` label, joined with the Bundesland name in the view).
    ruleKey: string;
    severity: ComplianceSeverity;
    url: string;
    // German label of the specific chamber/portal ("IHK Berlin"), when a
    // city-pack entry was used; '' otherwise. Proper noun, stays language-neutral.
    linkTitleDe: string;
    // true: the link is the specific regional body; false: a generic finder/portal.
    linkExact: boolean;
    noteKey: AuthorityNoteKey;
    portalKey: 'exact' | 'fallback';
    mapping: AuthorityMapping;
    extraHandwerkKey: HandwerkNoteKey | null;
    extraRecognitionKey: RecognitionNoteKey | null;
};

type ResolvedAuthorities = {
    organs: ResolvedAuthority[];
    stateCode: BundeslandCode | null;
    hasHigh: boolean;
};

type CitySlot = 'ihk' | 'hwk' | 'gewerbe';

// The part of a single organ that depends on the authority type / city pack.
type LinkChoice = {
    url: string;
    linkTitleDe: string;
    linkExact: boolean;
    noteKey: AuthorityNoteKey;
    portalKey: 'exact' | 'fallback';
    mapping: AuthorityMapping;
};

function isOfficialFallbackKey(key: string): key is OfficialFallbackKey {
    return key in OFFICIAL_FALLBACKS;
}

/**
 * Pick a city-specific body for one slot, or fall back to a nationwide portal.
 * `exactNote`/`fbNote` are the note keys for the precise vs. fallback case.
 */
function fromCitySlot(
    slot: CitySlot,
    ca: CityAuthority | undefined,
    fallbackUrl: string,
    exactNote: AuthorityNoteKey,
    fbNote: AuthorityNoteKey,
): LinkChoice {
    const ref = ca ? ca[slot] : undefined;
    if (ref) {
        return {
            url: ref.url,
            linkTitleDe: ref.label_de,
            linkExact: ref.exact,
            noteKey: ref.exact ? exactNote : fbNote,
            portalKey: ref.exact ? 'exact' : 'fallback',
            mapping: 'city_pack',
        };
    }
    return {
        url: fallbackUrl,
        linkTitleDe: '',
        linkExact: false,
        noteKey: fbNote,
        portalKey: 'fallback',
        mapping: 'fallback',
    };
}

// Authority types routed through the "recognition in Germany" path.
const ANERKENNUNG_TYPES = new Set([
    'NOT', 'RAK', 'LANDESPRAEF', 'GESUNDHEIT', 'LAND', 'STB_Kammer', 'WPK',
]);

function chooseLink(rule: ComplianceRule, ca: CityAuthority | undefined): LinkChoice {
    // 1. link_override wins over authority type (BaFin / Zoll links).
    const ov = rule.linkOverride;
    if (ov && isOfficialFallbackKey(ov)) {
        return {
            url: OFFICIAL_FALLBACKS[ov],
            linkTitleDe: '',
            linkExact: false,
            noteKey: 'linkOverride',
            portalKey: 'fallback',
            mapping: 'override',
        };
    }

    switch (rule.authorityType) {
        case 'HWK':
            return fromCitySlot('hwk', ca, OFFICIAL_FALLBACKS.handwerkZdh, 'hwkExact', 'hwkFb');
        case 'IHK':
        case 'BAFIN_IHK':
            return fromCitySlot('ihk', ca, OFFICIAL_FALLBACKS.ihkOrganisationFinder, 'ihkExact', 'ihkFb');
        case 'GEWERBE':
            return fromCitySlot('gewerbe', ca, OFFICIAL_FALLBACKS.serviceBund, 'gewExact', 'gewFb');
        case 'TAXI_OR_STRASSEN':
            return fromCitySlot('gewerbe', ca, OFFICIAL_FALLBACKS.serviceBund, 'taxiExact', 'taxiFb');
        case 'ORDNUNG':
            return fromCitySlot('gewerbe', ca, OFFICIAL_FALLBACKS.serviceBund, 'ordExact', 'ordFb');
        default:
            if (ANERKENNUNG_TYPES.has(rule.authorityType)) {
                return {
                    url: OFFICIAL_FALLBACKS.anerkennungInDeutschland,
                    linkTitleDe: '',
                    linkExact: false,
                    noteKey: 'anerk',
                    portalKey: 'fallback',
                    mapping: 'anerkennung',
                };
            }
            // Unknown authority type → regional IHK, as in the legacy default.
            return fromCitySlot('ihk', ca, OFFICIAL_FALLBACKS.ihkOrganisationFinder, 'defExact', 'defFb');
    }
}

function handwerkNote(rule: ComplianceRule): HandwerkNoteKey | null {
    if (rule.authorityType !== 'HWK') {
        return null;
    }
    if (rule.key === 'handwerk_a' || (rule.requiresMeisterbrief && rule.key !== 'handwerk_b')) {
        return 'handA';
    }
    if (rule.key === 'handwerk_b') {
        return 'handB';
    }
    return null;
}

function recognitionNote(rule: ComplianceRule, mapping: AuthorityMapping): RecognitionNoteKey | null {
    if (!rule.requiresRecognition) {
        return null;
    }
    return mapping === 'anerkennung' ? 'recogAn' : 'recogGen';
}

/**
 * Resolve the competent authority + link for every matched rule.
 *
 * @param cityName  user's city (matched against the city authority map)
 * @param stateCode user's Bundesland, or null if not detected
 * @param rules     matched compliance rules (from the compliance engine)
 */
function resolveAuthorities(
    cityName: string,
    stateCode: BundeslandCode | null,
    rules: ComplianceRule[],
): ResolvedAuthorities {
    const ca = findCityAuthority(cityName);

    const organs = rules.map((rule): ResolvedAuthority => {
        const link = chooseLink(rule, ca);
        return {
            ruleKey: rule.key,
            severity: rule.severity,
            url: link.url,
            linkTitleDe: link.linkTitleDe,
            linkExact: link.linkExact,
            noteKey: link.noteKey,
            portalKey: link.portalKey,
            mapping: link.mapping,
            extraHandwerkKey: handwerkNote(rule),
            extraRecognitionKey: recognitionNote(rule, link.mapping),
        };
    });

    const hasHigh = rules.some((rule) => rule.severity === 'high');

    return { organs, stateCode, hasHigh };
}


export { resolveAuthorities, OFFICIAL_FALLBACKS };
export type {
    OfficialFallbackKey,
    AuthorityNoteKey,
    HandwerkNoteKey,
    RecognitionNoteKey,
    AuthorityMapping,
    ResolvedAuthority,
    ResolvedAuthorities,
};