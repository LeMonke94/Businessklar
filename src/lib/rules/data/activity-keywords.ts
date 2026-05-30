import type { ActivityCategory, BgCode } from '@/features/questionnaire/types';


/**
 * Activity keyword table — the data the local ActivityDetectionEngine matches
 * against. Taken verbatim from the legacy ACTIVITIES array (18 entries over 12
 * categories), order preserved.
 *
 * Notes from the legacy:
 * - A category can appear several times with different BG codes / Freiberufler
 *   flags (e.g. `services` under BG Verkehr, SVLFG and BG ETEM), which is why
 *   bgCode and freiberuflerEligible live on each entry, not on the category.
 * - The last entry (`other`) has no terms — it is the fallback when nothing
 *   matches.
 * - Terms are matched case-insensitively as substrings, in both directions
 *   (query in term, term in query); detection picks the longest matching term.
 *
 * Completeness: lifted from search snippets. Cross-check against the legacy
 * ACTIVITIES array if a keyword seems to be missing.
 */

type ActivityKeywordEntry = {
    category: ActivityCategory;
    bgCode: BgCode;
    freiberuflerEligible: boolean;
    terms: string[];
};

const activityKeywords: ActivityKeywordEntry[] = [
    // IT & Digital — VBG
    {
        category: 'it_digital',
        bgCode: 'VBG',
        freiberuflerEligible: true,
        terms: [
            'software', 'entwicklung', 'programmierung', 'webentwicklung', 'web development',
            'it', 'informatik', 'saas', 'app', 'mobile', 'devops', 'cloud', 'hosting', 'server',
            'netzwerk', 'cybersecurity', 'sicherheit', 'datenbank', 'ki', 'ai', 'machine learning',
            'data science', 'blockchain', 'chatbot', 'erp', 'crm', 'api', 'embedded', 'fintech',
            'ecommerce platform', 'разработка', 'программирование', 'it-консалтинг', 'веб',
            'приложение', 'облако', 'безопасность',
        ],
    },
    // Marketing & Media — VBG
    {
        category: 'creative',
        bgCode: 'VBG',
        freiberuflerEligible: true,
        terms: [
            'marketing', 'werbung', 'design', 'grafik', 'foto', 'video', 'film', 'animation',
            'content', 'social media', 'seo', 'copywriting', 'pr', 'branding', 'podcast',
            'illustration', 'youtube', 'tiktok', 'influencer', 'medien', 'agentur', 'motion',
            'маркетинг', 'дизайн', 'фото', 'видео', 'реклама', 'контент', 'бренд',
        ],
    },
    // Regulated professions — do not imply Freiberufler automatically
    {
        category: 'regulated_advice',
        bgCode: 'VBG',
        freiberuflerEligible: false,
        terms: [
            'steuerberatung', 'steuerberater', 'steuerbüro', 'rechtsanwalt', 'rechtsanwältin',
            'patentanwalt', 'wirtschaftsprüfung', 'wirtschaftsprüfer', 'wp-stelle', 'tax advisor',
            'wirtschaftspruefer',
        ],
    },
    // Consulting — VBG (generic; no regulated titles)
    {
        category: 'consulting',
        bgCode: 'VBG',
        freiberuflerEligible: true,
        terms: [
            'beratung', 'consulting', 'consultant', 'coaching', 'unternehmensberatung',
            'strategieberatung', 'managementberatung', 'personalberatung', 'karriereberatung',
            'trainer', 'coach', 'konsultation', 'консалтинг', 'консультация', 'тренинг', 'советник',
        ],
    },
    // Education — VBG
    {
        category: 'consulting',
        bgCode: 'VBG',
        freiberuflerEligible: true,
        terms: [
            'schule', 'bildung', 'nachhilfe', 'sprachschule', 'sprachkurs', 'training',
            'weiterbildung', 'kurs', 'seminar', 'lehre', 'tutoring', 'онлайн-курс', 'обучение',
            'репетитор', 'языковая школа',
        ],
    },
    // Craft / Handwerk — BG BAU
    {
        category: 'craft',
        bgCode: 'BG BAU',
        freiberuflerEligible: false,
        terms: [
            'handwerk', 'bau', 'bauarbeiten', 'tischler', 'schreiner', 'elektriker', 'sanitär',
            'dachdecker', 'maler', 'fliesenleger', 'schlosser', 'schweißer', 'installateur',
            'heizung', 'klimaanlage', 'kfz', 'mechatroniker', 'lackierer', 'zimmermann', 'маляр',
            'строитель', 'электрик', 'сантехник', 'плотник', 'сварщик', 'механик',
        ],
    },
    // Trade / Handel — BGHW
    {
        category: 'trade',
        bgCode: 'BGHW',
        freiberuflerEligible: false,
        terms: [
            'handel', 'shop', 'laden', 'einzelhandel', 'großhandel', 'verkauf', 'ecommerce',
            'online shop', 'boutique', 'supermarkt', 'markt', 'import', 'export', 'торговля',
            'магазин', 'склад', 'интернет-магазин', 'розница', 'опт',
        ],
    },
    // Gastronomy — BGN
    {
        category: 'gastro',
        bgCode: 'BGN',
        freiberuflerEligible: false,
        terms: [
            'restaurant', 'café', 'bar', 'imbiss', 'catering', 'konditorei', 'bäckerei',
            'metzgerei', 'lieferservice', 'gastronomie', 'bistro', 'pizzeria', 'sushi', 'döner',
            'food truck', 'winery', 'brauerei', 'ресторан', 'кафе', 'бар', 'доставка еды',
            'кейтеринг', 'пекарня', 'кондитерская',
        ],
    },
    // Personal care / beauty (typically Gewerbe, not Freiberufler)
    {
        category: 'personal_care',
        bgCode: 'BG ETEM',
        freiberuflerEligible: false,
        terms: [
            'kosmetik', 'kosmetiker', 'kosmetikstudio', 'beauty', 'nagelstudio', 'nagel',
            'friseur', 'frisör', 'barbershop', 'haarsalon', 'hairdresser', 'tatoo', 'tattoo',
            'парикмахер', 'косметолог', 'маникюр', 'салон красоты',
        ],
    },
    // Medical — BGW
    {
        category: 'medical',
        bgCode: 'BGW',
        freiberuflerEligible: true,
        terms: [
            'arzt', 'ärztin', 'zahnarzt', 'physiotherapie', 'therapie', 'pflege', 'pflegedienst',
            'apotheke', 'optiker', 'heilpraktiker', 'psychotherapie', 'ergotherapie', 'logopädie',
            'врач', 'медицина', 'терапия', 'уход', 'аптека',
        ],
    },
    // Transport — BG Verkehr
    {
        category: 'services',
        bgCode: 'BG Verkehr',
        freiberuflerEligible: false,
        terms: [
            'transport', 'spedition', 'logistik', 'kurier', 'taxi', 'fahrer', 'umzug', 'lieferung',
            'fahrdienst', 'транспорт', 'логистика', 'такси', 'курьер', 'перевозки', 'грузоперевозки',
        ],
    },
    // Agriculture — SVLFG
    {
        category: 'services',
        bgCode: 'SVLFG',
        freiberuflerEligible: false,
        terms: [
            'landwirtschaft', 'gartenbau', 'garten', 'forstwirtschaft', 'landwirt', 'bauer',
            'pflanzenbau', 'tierhaltung', 'сельское хозяйство', 'садоводство', 'фермер',
        ],
    },
    // Real Estate — VBG / varies
    {
        category: 'consulting',
        bgCode: 'VBG',
        freiberuflerEligible: false,
        terms: [
            'immobilien', 'makler', 'hausverwaltung', 'verwalter', 'immobilienvermittlung',
            'недвижимость', 'маклер', 'аренда', 'риэлтор',
        ],
    },
    // Finance / accounting office — conservative
    {
        category: 'finance_services',
        bgCode: 'VBG',
        freiberuflerEligible: false,
        terms: [
            'finanz', 'versicherungsmakler', 'buchhalter', 'buchhaltung', 'bilanzbuchhalter',
            'lohnbuchhaltung', 'финансы', 'бухгалтерия', 'бухгалтер', 'налоги',
        ],
    },
    // Events — VBG
    {
        category: 'creative',
        bgCode: 'VBG',
        freiberuflerEligible: false,
        terms: [
            'event', 'veranstaltung', 'messe', 'hochzeit', 'party', 'catering event', 'eventmanager',
            'мероприятие', 'ивент', 'свадьба', 'организация событий',
        ],
    },
    // Cleaning — BG ETEM
    {
        category: 'services',
        bgCode: 'BG ETEM',
        freiberuflerEligible: false,
        terms: [
            'reinigung', 'putzen', 'gebäudereinigung', 'hausmeister', 'уборка', 'клининг',
            'обслуживание зданий',
        ],
    },
    // Legal — VBG
    {
        category: 'consulting',
        bgCode: 'VBG',
        freiberuflerEligible: true,
        terms: [
            'anwalt', 'rechtsanwalt', 'notar', 'jurist', 'kanzlei', 'юрист', 'адвокат', 'нотариус',
            'правовая консультация',
        ],
    },
    // Other — fallback when nothing matches
    {
        category: 'other',
        bgCode: 'BG (DGUV)',
        freiberuflerEligible: false,
        terms: [],
    },
];


export { activityKeywords };
export type { ActivityKeywordEntry };