import type { ComplianceRule, ComplianceSeverity } from '../compliance-engine';


/**
 * Compliance data — the keyword-matched regulatory rules and the generic
 * fallback signals, taken verbatim from the legacy compliance-rules.js
 * (activityComplianceRules + fallbackComplianceSignals).
 *
 * The data entry is richer than the engine's output ComplianceRule: it also
 * carries the `keywords` used for matching and the `linkOverride` used later
 * (Phase 9.5) to resolve authority links. The engine maps a matched entry down
 * to the port's ComplianceRule.
 *
 * Authority resolution itself (CITY_AUTHORITY_MAP, IHK/HWK URLs) is NOT here;
 * per the port the engine only reports matched rules + a fallback flag.
 *
 * Completeness: lifted from search snippets (18 rules, 10 signals). Cross-check
 * against the legacy file if a keyword or rule seems to be missing.
 */

// Known authority types from legacy (authorityType is a free string in the
// port): STB_Kammer, WPK, RAK, NOT, LANDESPRAEF, GESUNDHEIT, BAFIN_IHK, IHK,
// TAXI_OR_STRASSEN, ORDNUNG, HWK, LAND, GEWERBE.
type ComplianceRuleData = ComplianceRule & {
    keywords: string[];
    // Legacy link_override: an official-source key resolved to a URL later.
    linkOverride: string | null;
};

type ComplianceFallbackSignal = {
    keywords: string[];
    bucket: string;
};

const complianceRules: ComplianceRuleData[] = [
    {
        key: 'steuerberatung',
        keywords: ['steuerberatung', 'steuerberater', 'steuerbüro', 'tax advisor', 'налоговый консультант', 'стеуербератунг'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: true,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'STB_Kammer',
        linkOverride: null,
    },
    {
        key: 'wirtschaftspruefung',
        keywords: ['wirtschaftsprüfung', 'wp', 'abschlussprüfer', 'аудит', 'бухгалтерская проверка'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: true,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'WPK',
        linkOverride: null,
    },
    {
        key: 'rechtsanwalt',
        keywords: ['rechtsanwalt', 'anwalt', 'kanzlei', 'advokat', 'адвокат', 'юрист', 'rechtsberatung'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: true,
        requiresRecognition: true,
        requiresMeisterbrief: false,
        authorityType: 'RAK',
        linkOverride: null,
    },
    {
        key: 'notar',
        keywords: ['notar', 'notariat', 'нотариус'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: true,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'NOT',
        linkOverride: null,
    },
    {
        key: 'medizin',
        keywords: ['arzt', 'ärztin', 'zahnarzt', 'klinik', 'praxis', 'therapie', 'pflege', 'аптека', 'врач', 'медицин'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: true,
        requiresRecognition: true,
        requiresMeisterbrief: false,
        authorityType: 'LANDESPRAEF',
        linkOverride: null,
    },
    {
        key: 'apotheke',
        keywords: ['apotheke', 'pharmazie', 'pharma', 'аптека'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: true,
        requiresRecognition: true,
        requiresMeisterbrief: false,
        authorityType: 'GESUNDHEIT',
        linkOverride: null,
    },
    {
        key: 'vers34d',
        keywords: ['versicherungsmakler', 'versicherung', '§34d', '34d', 'страховой агент', 'insurance intermediary'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'BAFIN_IHK',
        linkOverride: 'bafinVersicherungsvermittler',
    },
    {
        key: 'fin34f',
        keywords: ['34f', '§34f', 'finanzanlagen', 'investment', 'vermittler', 'finanzinvest'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'BAFIN_IHK',
        linkOverride: 'bafin34f',
    },
    {
        key: 'immob34c',
        keywords: ['immobilienmakler', 'makler', 'hausverwaltung', '34c', 'недвижимость', 'риэлтор'],
        severity: 'medium',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'IHK',
        linkOverride: null,
    },
    {
        key: 'immob34i',
        keywords: ['34i', '§34i', 'immobiliardarlehen', 'kreditvermittlung'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'IHK',
        linkOverride: null,
    },
    {
        key: 'sicher34a',
        keywords: ['sicherheitsdienst', 'security', 'охрана', '34a'],
        severity: 'medium',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'IHK',
        linkOverride: null,
    },
    {
        key: 'transport',
        keywords: ['taxi', 'mietwagen', 'personenbeförderung', 'omnibus', 'lkw', 'führerschein', 'перевозки', 'такси'],
        severity: 'medium',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'TAXI_OR_STRASSEN',
        linkOverride: null,
    },
    {
        key: 'gastro_alk',
        keywords: ['gaststätte', 'restaurant', 'alkohol', 'ausschank', 'schankwirtschaft', 'ресторан', 'алкоголь'],
        severity: 'medium',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'ORDNUNG',
        linkOverride: 'zollGewerbe',
    },
    {
        key: 'handwerk_a',
        keywords: ['handwerk', 'meister', 'handwerksrolle', 'elektriker', 'sanitär', 'tischler', 'handwerkskarte'],
        severity: 'high',
        requiresLicense: true,
        requiresRegistration: true,
        requiresDegree: true,
        requiresRecognition: true,
        requiresMeisterbrief: true,
        authorityType: 'HWK',
        linkOverride: null,
    },
    {
        key: 'handwerk_b',
        keywords: ['anlage b', 'handwerksähnlich', 'bodenleger', 'schilder'],
        severity: 'medium',
        requiresLicense: false,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'HWK',
        linkOverride: null,
    },
    {
        key: 'buchhaltung_eu',
        keywords: ['buchhaltung', 'buchhalter', 'lohnbuchhaltung', 'финбух', 'бухгалтерия'],
        severity: 'medium',
        requiresLicense: false,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'IHK',
        linkOverride: null,
    },
    {
        key: 'lehrer_reg',
        keywords: ['lehrer', 'erzieher', 'kita-leitung', 'schule', 'ausbildung'],
        severity: 'medium',
        requiresLicense: false,
        requiresRegistration: false,
        requiresDegree: true,
        requiresRecognition: true,
        requiresMeisterbrief: false,
        authorityType: 'LAND',
        linkOverride: null,
    },
    {
        key: 'it_low_risk',
        keywords: ['software', 'webdesign', 'übersetzung', 'marketing', 'programmier', 'entwickler', 'it-dienst'],
        severity: 'info',
        requiresLicense: false,
        requiresRegistration: true,
        requiresDegree: false,
        requiresRecognition: false,
        requiresMeisterbrief: false,
        authorityType: 'GEWERBE',
        linkOverride: null,
    },
];

const fallbackSignals: ComplianceFallbackSignal[] = [
    { keywords: ['medizin', 'arzt', 'pflege', 'therapie', 'zahn'], bucket: 'med' },
    { keywords: ['finanz', 'invest', 'kredit', 'versicherung'], bucket: 'fin' },
    { keywords: ['steuer', 'buchhaltung', 'bilanz'], bucket: 'tax' },
    { keywords: ['recht', 'anwalt', 'notar'], bucket: 'law' },
    { keywords: ['bau', 'bauunternehmen', 'handwerk', 'sanitär', 'elektro', 'строитель'], bucket: 'craft' },
    { keywords: ['sicherheit', 'security', 'bewachung'], bucket: 'sec' },
    { keywords: ['transport', 'taxi', 'spedition'], bucket: 'trans' },
    { keywords: ['bildung', 'lehrer', 'ausbildung'], bucket: 'edu' },
    { keywords: ['immobilien', 'makler'], bucket: 're' },
    { keywords: ['steuerberatung', 'wirtschaftsprüfung'], bucket: 'taxpro' },
];

// Severity ordering for sorting matched rules (high first), as in legacy.
const severityOrder: Record<ComplianceSeverity, number> = {
    high: 0,
    medium: 1,
    info: 2,
};


export { complianceRules, fallbackSignals, severityOrder };
export type { ComplianceRuleData, ComplianceFallbackSignal };