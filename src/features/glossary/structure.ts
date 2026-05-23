/**
 * Glossary structure — defines which categories and terms exist and in what
 * order. The actual text content (names, descriptions) lives in the
 * translation files under the `glossary` namespace, referenced by these keys.
 *
 * To add a term: add its key here, then add the matching texts in all
 * messages/*.json files under glossary.terms.<key>.
 */

type GlossaryCategory = {
    categoryKey: string;
    termKeys: string[];
};

const glossaryStructure: GlossaryCategory[] = [
    {
        categoryKey: 'activity',
        termKeys: ['freelancer', 'tradeBusiness', 'agriculture', 'otherSelfEmployment'],
    },
    {
        categoryKey: 'legalForms',
        termKeys: [
            'soleProprietorship',
            'registeredTrader',
            'gbr',
            'partg',
            'partgMbb',
            'ug',
            'gmbh',
            'ag',
            'ohg',
            'kg',
            'gmbhCoKg',
            'holding',
        ]
    },
    {
        categoryKey: 'taxes',
        termKeys: [
            'incomeTax',
            'corporateTax',
            'tradeTax',
            'vat',
            'capitalGainsTax',
            'payrollTax',
            'solidaritySurcharge',
            'churchTax',
            'propertyTax',
            'inheritanceGiftTax',
        ],
    },
    {
        categoryKey: 'numbers',
        termKeys: ['taxId', 'vatId', 'companyNumber'],
    },
];


export { glossaryStructure };
export type { GlossaryCategory };