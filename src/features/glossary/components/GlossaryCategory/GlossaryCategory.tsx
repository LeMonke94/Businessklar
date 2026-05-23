import { getTranslations } from 'next-intl/server';
import { GlossaryTerm } from '@/features/glossary/components/GlossaryTerm';
import { type GlossaryCategory as CategoryType } from '@/features/glossary/structure';
import styles from './GlossaryCategory.module.css';

async function GlossaryCategory({ category }: { category: CategoryType }) {
    const t = await getTranslations('glossary');

    return (
        <div className={styles.category}>
            <h2 className={styles.heading}>
                {t(`categories.${category.categoryKey}`)}
            </h2>

            {category.termKeys.map((termKey) => (
                <GlossaryTerm
                    key={termKey}
                    nameDe={t(`terms.${termKey}.nameDe`)}
                    nameLocal={t(`terms.${termKey}.nameLocal`)}
                    body={t(`terms.${termKey}.body`)}
                />
            ))}
        </div>
    );
}

export { GlossaryCategory };