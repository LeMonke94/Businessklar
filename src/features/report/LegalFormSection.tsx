'use client';

import { useTranslations } from 'next-intl';
import type { LegalForm, BusinessStatus } from '@/lib/rules/legal-form-engine';
import styles from './LegalFormSection.module.css';


// German display labels for the legal forms (legacy used these across locales).
const LEGAL_FORM_LABELS: Record<LegalForm, string> = {
    einzelunternehmen: 'Einzelunternehmen',
    ug: 'UG (haftungsbeschränkt)',
    gmbh: 'GmbH',
    gbr: 'GbR',
    partg: 'PartG',
};

type LegalFormSectionProps = {
    recommended: LegalForm;
    eligible: LegalForm[];
    activeForm: LegalForm;
    status: BusinessStatus;
    onSelectForm: (form: LegalForm) => void;
};

/**
 * The legal-form area of the report: the active form name + tax-status badge,
 * a switcher over every eligible form (changing it recomputes the finances in
 * the container), and the short description of the active form. The recommended
 * form is marked so it stays identifiable after the user switches away.
 */
function LegalFormSection({ recommended, eligible, activeForm, status, onSelectForm }: LegalFormSectionProps) {
    const t = useTranslations('report');

    return (
        <section className={styles.card}>
            <div className={styles.head}>
                <div className={styles.title}>
                    <span className={styles.label}>{t('legalFormLabel')}</span>{' '}
                    <strong>{LEGAL_FORM_LABELS[activeForm]}</strong>
                </div>
                <span className={status === 'freiberuflich' ? styles.badgeFb : styles.badgeGew}>
                    {t(`status.${status}`)}
                </span>
            </div>

            <div className={styles.switcher} role="group">
                {eligible.map((form) => {
                    const active = form === activeForm;
                    return (
                        <button
                            key={form}
                            type="button"
                            aria-pressed={active}
                            className={`${styles.switchBtn} ${active ? styles.switchActive : ''}`}
                            onClick={() => onSelectForm(form)}
                        >
                            {LEGAL_FORM_LABELS[form]}
                            {form === recommended && <span className={styles.recTag}>{t('recommended')}</span>}
                        </button>
                    );
                })}
            </div>

            <p className={styles.desc}>{t(`legalFormDescriptions.${activeForm}`)}</p>
        </section>
    );
}


export { LegalFormSection, LEGAL_FORM_LABELS };
export type { LegalFormSectionProps };