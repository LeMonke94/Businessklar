'use client';

import { useTranslations, useLocale } from 'next-intl';
import { formatEuro } from '@/lib/finance/format';
import type { TaxResult } from '@/lib/finance/tax';
import type { ReportData } from '@/features/questionnaire/service';
import styles from './FinanceSection.module.css';


type FinanceSectionProps = {
    report: ReportData;
    tax: TaxResult;
    // Trade-tax multiplier used in the calculation (shown in the GewSt row).
    hebesatz: number;
};

type LineProps = {
    label: string;
    hint?: string;
    value: string;
    tone?: 'neg' | 'pos';
    big?: boolean;
};

function Line({ label, hint, value, tone, big }: LineProps) {
    return (
        <div className={styles.row}>
            <div className={styles.label}>
                {label}
                {hint && <small className={styles.hint}>{hint}</small>}
            </div>
            <div
                className={[styles.value, tone === 'neg' ? styles.neg : '', tone === 'pos' ? styles.pos : '', big ? styles.big : '']
                    .filter(Boolean)
                    .join(' ')}
            >
                {value}
            </div>
        </div>
    );
}

/**
 * Renders the revenue/expense breakdown and the tax calculation for the active
 * legal form. Personal and capital companies show different tax lines (the tax
 * result is a discriminated union); labels are i18n, numbers are formatted for
 * the active locale.
 */
function FinanceSection({ report, tax, hebesatz }: FinanceSectionProps) {
    const t = useTranslations('report');
    const locale = useLocale();
    const euro = (value: number) => formatEuro(value, locale);

    const { staffFulltime, staffMinijob } = report.finance;
    const isGewerblich = !report.activity.freiberuflerEligible;

    return (
        <div className={styles.wrap}>
            {/* Revenue & expenses */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>{t('revenueExpenses.title')}</h3>
                <Line label={t('revenueExpenses.revenue')} value={euro(tax.annualRevenue)} />
                <Line
                    label={t('revenueExpenses.expenses')}
                    hint={t('revenueExpenses.expensesHint')}
                    value={euro(-tax.annualExpenses)}
                    tone="neg"
                />
                {staffFulltime > 0 && (
                    <Line
                        label={t('revenueExpenses.payroll', { count: staffFulltime })}
                        value={euro(-tax.fulltimeStaffCost)}
                        tone="neg"
                    />
                )}
                {staffMinijob > 0 && (
                    <Line
                        label={t('revenueExpenses.minijob', { count: staffMinijob })}
                        value={euro(-tax.minijobStaffCost)}
                        tone="neg"
                    />
                )}
                <div className={styles.total}>
                    <strong>{t('revenueExpenses.profitBeforeTax')}</strong>
                    <span className={tax.profitBeforeTax >= 0 ? styles.pos : styles.neg}>
                        {euro(tax.profitBeforeTax)}
                    </span>
                </div>
            </div>

            {/* Tax calculation */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>{t('tax.title')}</h3>
                <p className={styles.info}>{t('tax.approxNote')}</p>

                {tax.kind === 'personal' ? (
                    <>
                        <Line
                            label={t('tax.incomeTax')}
                            hint={t('tax.marginalRate', { rate: tax.marginalRate })}
                            value={euro(tax.incomeTax)}
                            tone="neg"
                        />
                        {isGewerblich && (
                            <>
                                <Line
                                    label={t('tax.tradeTax')}
                                    hint={t('tax.tradeTaxRate', { hb: hebesatz, city: report.city.name })}
                                    value={euro(tax.tradeTax)}
                                    tone="neg"
                                />
                                <Line
                                    label={t('tax.tradeTaxCredit')}
                                    hint={t('tax.tradeTaxCreditHint')}
                                    value={euro(tax.tradeTaxCredit)}
                                    tone="pos"
                                />
                            </>
                        )}
                        <Line label={t('tax.soli')} hint={t('tax.soliIncomeHint')} value={euro(tax.soli)} tone="neg" />
                        <div className={styles.separator} />
                        <Line label={t('tax.netIncome')} value={euro(tax.netProfit)} tone="pos" big />
                    </>
                ) : (
                    <>
                        <Line label={t('tax.corporateTax')} hint={t('tax.corporateTaxHint')} value={euro(tax.corporateTax)} tone="neg" />
                        <Line label={t('tax.soli')} hint={t('tax.soliCorporateHint')} value={euro(tax.soli)} tone="neg" />
                        <Line
                            label={t('tax.tradeTax')}
                            hint={t('tax.tradeTaxRate', { hb: hebesatz, city: report.city.name })}
                            value={euro(tax.tradeTax)}
                            tone="neg"
                        />
                        <div className={styles.separator} />
                        <Line label={t('tax.profitAfterTax')} hint={t('tax.staysInCompany')} value={euro(tax.profitAfterTax)} tone="pos" big />
                        <div className={styles.separator} />
                        <p className={styles.subhead}>{t('tax.dividendPayout')}</p>
                        <Line label={t('tax.capitalGainsTax')} hint={t('tax.onDividends')} value={euro(tax.capitalGainsTax)} tone="neg" />
                        <Line label={t('tax.soli')} hint={t('tax.soliShortHint')} value={euro(tax.soliOnDividend)} tone="neg" />
                        <Line label={t('tax.netInOwnerHands')} value={euro(tax.netInOwnerHands)} tone="pos" big />
                    </>
                )}
            </div>

            {/* VAT (hidden for Kleinunternehmer) */}
            {!tax.isKleinunternehmer && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>{t('vat.title')}</h3>
                    <Line label={t('vat.standardRate')} value="19%" />
                    <Line label={t('vat.reducedRate')} value="7%" />
                    <Line label={t('vat.voranmeldung')} hint={t('vat.voranmeldungHint')} value="ELSTER.de" />
                </div>
            )}

            {tax.isKleinunternehmer && <p className={styles.note}>{t('kleinunternehmer')}</p>}
        </div>
    );
}


export { FinanceSection };
export type { FinanceSectionProps };