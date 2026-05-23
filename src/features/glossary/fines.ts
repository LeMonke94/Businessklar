/**
 * Fines section structure. The `law` reference is a constant German legal
 * term (not translated). Title, amount and description live in the
 * translation files under glossary.fines.items.<key>.
 *
 * VAT traps reuse the accordion pattern; their texts live under
 * glossary.fines.vatTraps.<key>.
 */

type Fine = {
    key: string;
    law: string;
};

type VatTrap = {
    key: string;
};

const finesStructure: Fine[] = [
    { key: 'noImprint', law: 'Telemediengesetz' },
    { key: 'dataPrivacy', law: 'GDPR / DSGVO' },
    { key: 'photosNoLicense', law: 'UrhG' },
    { key: 'tillNoTse', law: 'Kassensicherungsverordnung' },
    { key: 'undeclaredWork', law: 'AEntG / SchwArbG' },
    { key: 'workingTime', law: 'Arbeitszeitgesetz' },
    { key: 'cctvNoNotice', law: 'DSGVO' },
    { key: 'advertisingNoPermit', law: 'Landesbauordnung' },
    { key: 'alcoholNoLicense', law: 'GaststättenG' },
    { key: 'outdoorSeating', law: 'Gemeindesatzung' },
    { key: 'noiseAfter10', law: 'Bundesimmissionsschutzgesetz' },
    { key: 'incorrectInvoices', law: 'UStG' },
    { key: 'lateTaxReturn', law: 'AO § 152' },
    { key: 'gema', law: 'UrhG / GEMA' },
    { key: 'noBgRegistration', law: 'SGB VII' },
];

const vatTrapsStructure: VatTrap[] = [
    { key: 'restaurantVsTakeaway' },
    { key: 'drinksAlways19' },
    { key: 'delivery7or19' },
    { key: 'b2bEu' },
    { key: 'b2cEu' },
    { key: 'onlineCourses' },
    { key: 'kleinunternehmerInvoice' },
    { key: 'euPurchase' },
    { key: 'carPrivateUse' },
    { key: 'vatIsStateMoney' },
];

export { finesStructure, vatTrapsStructure };
export type { Fine, VatTrap };