import type { BgCode } from '@/features/questionnaire/types';


/**
 * Berufsgenossenschaft links — the official website for each statutory
 * accident-insurance carrier, copied verbatim from the legacy bgMap
 * (index.html generateReport). The carrier itself is detected during activity
 * detection (stored as `activity_bg`); this map only resolves it to a URL.
 *
 * Keyed by the BgCode union, so the map is exhaustive: every carrier a detected
 * activity can carry has a link here.
 */
const berufsgenossenschaftUrls: Record<BgCode, string> = {
    'VBG': 'https://www.vbg.de/',
    'BG ETEM': 'https://www.bgetem.de/',
    'BG BAU': 'https://www.bgbau.de/',
    'BGHW': 'https://www.bghw.de/',
    'BGN': 'https://www.bgn.de/',
    'BGW': 'https://www.bgw-online.de/',
    'BG Verkehr': 'https://www.bg-verkehr.de/',
    'SVLFG': 'https://www.svlfg.de/',
    'BG (DGUV)': 'https://bg-check.dguv.de/',
};


export { berufsgenossenschaftUrls };
