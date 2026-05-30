/**
 * Obligations calendar — the recurring tax/reporting duties for a business and
 * how often each falls due. Ports the legacy generateReport calendar block (the
 * `cal` array with its isK / hasStaff / isFB conditions).
 *
 * Pure + synchronous: a total derivation over three flags. Returns only the duty
 * key + its frequency; the view resolves the name and the deadline detail to
 * text via next-intl. Because Kleinunternehmer status depends on the chosen
 * legal form (it comes from the tax result), the report recomputes this when the
 * user switches form.
 *
 * Pure: no React, no DOM, no Supabase, no i18n.
 */

type ObligationFrequency = 'monthly' | 'quarterly' | 'yearly';

type ObligationKey =
    | 'ustVoranmeldung'
    | 'lohnsteuer'
    | 'gewerbesteuerVorauszahlung'
    | 'einkommensteuerVorauszahlung'
    | 'jahressteuererklaerung'
    | 'gewerbesteuererklaerung'
    | 'lohnsteuerjahresausgleich';

type Obligation = {
    key: ObligationKey;
    frequency: ObligationFrequency;
};

type ObligationsInput = {
    // Kleinunternehmer (§ 19 UStG): no VAT pre-registration, no trade-tax prepayment.
    isKleinunternehmer: boolean;
    // At least one full-time or minijob employee.
    hasStaff: boolean;
    // Freiberufler pay no Gewerbesteuer, so those duties drop out.
    freiberuflerEligible: boolean;
};


/**
 * Build the list of recurring obligations, in the legacy order. Each duty is
 * gated on the same conditions as the legacy report.
 */
function deriveObligations(input: ObligationsInput): Obligation[] {
    const { isKleinunternehmer, hasStaff, freiberuflerEligible } = input;

    const obligations: Obligation[] = [];

    if (!isKleinunternehmer) {
        obligations.push({ key: 'ustVoranmeldung', frequency: 'monthly' });
    }
    if (hasStaff) {
        obligations.push({ key: 'lohnsteuer', frequency: 'monthly' });
    }
    if (!freiberuflerEligible && !isKleinunternehmer) {
        obligations.push({ key: 'gewerbesteuerVorauszahlung', frequency: 'quarterly' });
    }

    obligations.push({ key: 'einkommensteuerVorauszahlung', frequency: 'quarterly' });
    obligations.push({ key: 'jahressteuererklaerung', frequency: 'yearly' });

    if (!freiberuflerEligible) {
        obligations.push({ key: 'gewerbesteuererklaerung', frequency: 'yearly' });
    }
    if (hasStaff) {
        obligations.push({ key: 'lohnsteuerjahresausgleich', frequency: 'yearly' });
    }

    return obligations;
}


export { deriveObligations };
export type { ObligationFrequency, ObligationKey, Obligation, ObligationsInput };
