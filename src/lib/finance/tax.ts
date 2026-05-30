import type { LegalForm } from '@/lib/rules/legal-form-engine';


/**
 * Tax & income calculation — a pure port of the legacy report finance block
 * ("Basisversion"). No React, no DOM, no data lookups: the Hebesatz is passed
 * in, so this module is independent of the city data and fully testable.
 *
 * Two branches, exactly as in legacy:
 * - capital companies (UG / GmbH): Körperschaftsteuer + Soli + Gewerbesteuer,
 *   then a dividend-payout view (Kapitalertragsteuer + Soli).
 * - sole trader / partnership (Einzelunternehmen / GbR / PartG): progressive
 *   Einkommensteuer, optional Gewerbesteuer with credit, Soli.
 *
 * The figures are deliberately the legacy approximations (linear per-bracket
 * income tax, simplified employer factors). NOTE: legacy also applies the
 * 24,500 EUR Gewerbesteuer-Freibetrag to UG/GmbH — technically generous, but
 * reproduced verbatim so results match the legacy. Flagged for review.
 */

// --- Constants (verbatim from legacy) --------------------------------------
const DEFAULT_FT_SALARY = 3200;       // monthly gross when none given
const FT_EMPLOYER_FACTOR = 1.23;      // employer on-cost for full-time
const MINIJOB_MONTHLY = 538;          // minijob monthly base
const MINIJOB_EMPLOYER_FACTOR = 1.3;  // employer on-cost for minijob
const MONTHS = 12;

const GEWERBE_FREIBETRAG = 24500;
const GEWERBE_BASE_RATE = 0.035;      // Steuermesszahl
const TRADE_TAX_CREDIT_FACTOR = 3.8;  // Anrechnung cap factor (× Messbetrag)
const SOLI_RATE = 0.055;
const SOLI_INCOME_TAX_THRESHOLD = 18130;
const KST_RATE = 0.15;                // Körperschaftsteuer
const KAPEST_RATE = 0.25;             // Kapitalertragsteuer on dividends
const KLEINUNTERNEHMER_REVENUE = 25000;
const DEFAULT_HEBESATZ = 400;


type TaxInput = {
    revenueY1: number;
    expensesMonthly: number;
    staffFulltime: number;
    staffMinijob: number;
    staffSalaryFt?: number;
    // Municipal trade-tax multiplier in percent (e.g. 400). Defaults to the
    // nationwide average when omitted/invalid.
    hebesatz?: number;
    legalForm: LegalForm;
    freiberuflerEligible: boolean;
};

// Shared expense / profit breakdown for both branches.
type FinanceBreakdown = {
    annualRevenue: number;
    annualExpenses: number;
    fulltimeStaffCost: number;
    minijobStaffCost: number;
    profitBeforeTax: number;
    isKleinunternehmer: boolean;
};

type PersonalTax = FinanceBreakdown & {
    kind: 'personal';
    incomeTax: number;        // gross Einkommensteuer
    marginalRate: number;     // 0 | 14 | 32 | 42 | 45
    tradeTax: number;         // Gewerbesteuer (0 for Freiberufler)
    tradeTaxCredit: number;   // Anrechnung on income tax
    soli: number;
    totalTax: number;
    netProfit: number;
};

type CapitalTax = FinanceBreakdown & {
    kind: 'capital';
    corporateTax: number;     // Körperschaftsteuer
    soli: number;             // on corporate tax
    tradeTax: number;         // Gewerbesteuer
    totalTax: number;
    profitAfterTax: number;   // stays in the company
    // Dividend-payout view
    capitalGainsTax: number;  // Kapitalertragsteuer
    soliOnDividend: number;
    netInOwnerHands: number;
};

type TaxResult = PersonalTax | CapitalTax;


// Progressive Einkommensteuer — legacy per-bracket linear approximation.
function incomeTax(taxableProfit: number): { tax: number; marginalRate: number } {
    const p = taxableProfit;
    let tax = 0;
    if (p > 277826) {
        tax = p * 0.45;
    } else if (p > 66761) {
        tax = p * 0.42 - 9336;
    } else if (p > 15787) {
        tax = p * 0.32 - 2397;
    } else if (p > 10908) {
        tax = (p - 10908) * 0.14;
    }
    tax = Math.max(0, tax);

    const marginalRate = p > 277826 ? 45 : p > 66761 ? 42 : p > 15787 ? 32 : p > 10908 ? 14 : 0;
    return { tax, marginalRate };
}

function computeTax(input: TaxInput): TaxResult {
    const hebesatz = input.hebesatz && Number.isFinite(input.hebesatz) ? input.hebesatz : DEFAULT_HEBESATZ;
    const isCapitalCompany = input.legalForm === 'ug' || input.legalForm === 'gmbh';

    const annualRevenue = input.revenueY1;
    const annualExpenses = input.expensesMonthly * MONTHS;
    const ftSalary = input.staffFulltime > 0 && (input.staffSalaryFt ?? 0) > 0
        ? (input.staffSalaryFt as number)
        : DEFAULT_FT_SALARY;
    const fulltimeStaffCost = input.staffFulltime * ftSalary * FT_EMPLOYER_FACTOR * MONTHS;
    const minijobStaffCost = input.staffMinijob * MINIJOB_MONTHLY * MINIJOB_EMPLOYER_FACTOR * MONTHS;
    const profitBeforeTax = annualRevenue - (annualExpenses + fulltimeStaffCost + minijobStaffCost);

    const breakdown: FinanceBreakdown = {
        annualRevenue,
        annualExpenses,
        fulltimeStaffCost,
        minijobStaffCost,
        profitBeforeTax,
        // Kleinunternehmer only for non-capital companies (legacy isK).
        isKleinunternehmer: annualRevenue < KLEINUNTERNEHMER_REVENUE && !isCapitalCompany,
    };

    if (isCapitalCompany) {
        const corporateTax = Math.max(0, profitBeforeTax) * KST_RATE;
        const soli = corporateTax * SOLI_RATE;
        const tradeBase = Math.max(0, profitBeforeTax - GEWERBE_FREIBETRAG);
        const tradeTax = tradeBase * GEWERBE_BASE_RATE * (hebesatz / 100);
        const totalTax = corporateTax + soli + tradeTax;
        const profitAfterTax = profitBeforeTax - totalTax;
        const capitalGainsTax = Math.max(0, profitAfterTax) * KAPEST_RATE;
        const soliOnDividend = capitalGainsTax * SOLI_RATE;

        return {
            ...breakdown,
            kind: 'capital',
            corporateTax,
            soli,
            tradeTax,
            totalTax,
            profitAfterTax,
            capitalGainsTax,
            soliOnDividend,
            netInOwnerHands: profitAfterTax - capitalGainsTax - soliOnDividend,
        };
    }

    const { tax: incomeTaxGross, marginalRate } = incomeTax(profitBeforeTax);
    const soli = incomeTaxGross > SOLI_INCOME_TAX_THRESHOLD ? incomeTaxGross * SOLI_RATE : 0;

    let tradeTax = 0;
    if (!input.freiberuflerEligible) {
        const tradeBase = Math.max(0, profitBeforeTax - GEWERBE_FREIBETRAG);
        tradeTax = tradeBase * GEWERBE_BASE_RATE * (hebesatz / 100);
    }
    const tradeTaxCredit = Math.min(tradeTax * TRADE_TAX_CREDIT_FACTOR, incomeTaxGross);
    const incomeTaxNet = Math.max(0, incomeTaxGross - tradeTaxCredit);
    const totalTax = incomeTaxNet + soli + tradeTax;

    return {
        ...breakdown,
        kind: 'personal',
        incomeTax: incomeTaxGross,
        marginalRate,
        tradeTax,
        tradeTaxCredit,
        soli,
        totalTax,
        netProfit: profitBeforeTax - totalTax,
    };
}


export { computeTax };
export type { TaxInput, TaxResult, PersonalTax, CapitalTax, FinanceBreakdown };