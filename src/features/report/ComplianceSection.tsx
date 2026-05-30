'use client';

import { useTranslations } from 'next-intl';
import type { ComplianceResult, ComplianceRule } from '@/lib/rules/compliance-engine';
import { OFFICIAL_FALLBACKS, type ResolvedAuthority } from '@/lib/rules/authority-resolver';
import type { BundeslandCode } from '@/features/questionnaire/types';
import styles from './ComplianceSection.module.css';


type ComplianceSectionProps = {
    compliance: ComplianceResult;
    // Resolved responsible body + link per matched rule (keyed by ruleKey).
    authorities: ResolvedAuthority[];
    bundesland?: BundeslandCode;
};

const SEVERITY_CLASS: Record<ComplianceRule['severity'], string> = {
    high: styles.sevHigh,
    medium: styles.sevMedium,
    info: styles.sevInfo,
};

// External finder/portal links shown on the fallback cards. Labels are the
// official portal names — kept literal across locales, as in the legacy.
const LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;

/**
 * Compliance section. Renders the regulatory requirements the engine matched
 * (one card per rule, grouped visually by severity), each enriched with the
 * resolved competent authority and official link, plus the fallback-warning
 * and no-match cards.
 *
 * Per-rule text (title / authority / message / docs / next / risk / legal) is
 * resolved from the `compliance.ruleText.<key>` catalogue; link notes and portal
 * labels from `compliance.note.*` / `compliance.portal.*`. Each field is guarded
 * with t.has() so a missing catalogue entry is simply omitted rather than shown
 * as a raw key.
 */
function ComplianceSection({ compliance, authorities, bundesland }: ComplianceSectionProps) {
    const t = useTranslations('compliance');
    const { rules, fallbackWarning } = compliance;

    // Bundesland name when known; used both for the intro line (falling back to
    // legalUnknown) and to append to the per-rule authority line (only if known).
    const stateName = bundesland && t.has(`bundesland.${bundesland}`)
        ? t(`bundesland.${bundesland}`)
        : null;
    const stateLabel = stateName ?? t('legalUnknown');

    const organByKey = new Map(authorities.map((organ) => [organ.ruleKey, organ]));

    // Reads a per-rule text field if the catalogue has it, otherwise null.
    const ruleText = (rule: ComplianceRule, field: string): string | null => {
        const key = `ruleText.${rule.key}.${field}`;
        return t.has(key) ? t(key) : null;
    };

    return (
        <section className={styles.wrap}>
            <h2 className={styles.heading}>{t('title')}</h2>
            <p className={styles.legal}>
                {t('legalIntro')} {stateLabel}
            </p>

            {rules.length === 0 && fallbackWarning && (
                <div className={`${styles.card} ${styles.sevMedium}`}>
                    <div className={styles.badge}>{t('fbSensitive.title')}</div>
                    <p className={styles.body}>{t('fbSensitive.body')}</p>
                    <p className={styles.finders}>
                        <a href={OFFICIAL_FALLBACKS.ihkOrganisationFinder} {...LINK_PROPS}>IHK Organisationfinder</a>
                        {' · '}
                        <a href={OFFICIAL_FALLBACKS.handwerkZdh} {...LINK_PROPS}>handwerk.de</a>
                        {' · '}
                        <a href={OFFICIAL_FALLBACKS.anerkennungInDeutschland} {...LINK_PROPS}>Anerkennung in Deutschland</a>
                    </p>
                </div>
            )}

            {rules.length === 0 && !fallbackWarning && (
                <div className={`${styles.card} ${styles.sevInfo}`}>
                    <div className={styles.badge}>{t('noMatch.title')}</div>
                    <p className={styles.body}>{t('noMatch.body')}</p>
                    <p className={styles.finders}>
                        <a href={OFFICIAL_FALLBACKS.ihkOrganisationFinder} {...LINK_PROPS}>IHK Organisationfinder</a>
                        {' · '}
                        <a href={OFFICIAL_FALLBACKS.serviceBund} {...LINK_PROPS}>service-bund.de</a>
                    </p>
                </div>
            )}

            {rules.map((rule) => {
                const organ = organByKey.get(rule.key);
                const title = ruleText(rule, 'title');
                const message = ruleText(rule, 'message');
                const authority = ruleText(rule, 'authority');
                const docs = ruleText(rule, 'docs');
                const next = ruleText(rule, 'next');
                const risk = ruleText(rule, 'risk');
                const legal = ruleText(rule, 'legal');

                // "<authority> — <Bundesland>", appending the state only if known.
                const authorityLine = authority
                    ? (stateName ? `${authority} — ${stateName}` : authority)
                    : null;

                return (
                    <div key={rule.key} className={`${styles.card} ${SEVERITY_CLASS[rule.severity]}`}>
                        <div className={styles.badge}>
                            {rule.severity === 'high' && <span aria-hidden="true">⚠️ </span>}
                            {t(`severity.${rule.severity}`)}
                        </div>
                        {title && <h3 className={styles.cardTitle}>{title}</h3>}
                        {message && (
                            <p className={styles.row}>
                                <strong>{t('label.what')}:</strong> {message}
                            </p>
                        )}
                        {authorityLine && (
                            <p className={styles.row}>
                                <strong>{t('label.authority')}:</strong> {authorityLine}
                            </p>
                        )}
                        {organ?.extraHandwerkKey && (
                            <p className={styles.row}>
                                <strong>{t('label.handwerk')}:</strong> {t(`note.${organ.extraHandwerkKey}`)}
                            </p>
                        )}
                        {organ?.extraRecognitionKey && (
                            <p className={styles.row}>
                                <strong>{t('label.recognition')}:</strong> {t(`note.${organ.extraRecognitionKey}`)}
                            </p>
                        )}
                        {docs && (
                            <p className={styles.row}>
                                <strong>{t('label.mayNeed')}:</strong> {docs}
                            </p>
                        )}
                        {organ && (
                            <p className={styles.row}>
                                <strong>{t(`portal.${organ.portalKey}`)} ({t('label.link')}):</strong>{' '}
                                <a href={organ.url} {...LINK_PROPS}>{organ.url}</a>
                                {organ.linkTitleDe && <span className={styles.authDe}> ({organ.linkTitleDe})</span>}
                                <br />
                                <span className={styles.note}>{t(`note.${organ.noteKey}`)}</span>
                            </p>
                        )}
                        {organ && !organ.linkExact && (
                            <p className={styles.disclaimer}>{t('fallbackDisclaimer')}</p>
                        )}
                        {next && (
                            <p className={styles.row}>
                                <strong>{t('label.next')}:</strong> {next}
                            </p>
                        )}
                        {risk && (
                            <p className={`${styles.row} ${styles.risk}`}>
                                <strong>{t('label.risk')}:</strong> {risk}
                            </p>
                        )}
                        {legal && <p className={styles.footnote}>{t('label.legal')}: {legal}</p>}
                    </div>
                );
            })}

            {rules.length > 0 && fallbackWarning && (
                <div className={`${styles.card} ${styles.sevInfo}`}>
                    <p className={styles.body}>{t('extraFb')}</p>
                </div>
            )}
        </section>
    );
}


export { ComplianceSection };
export type { ComplianceSectionProps };