import styles from './FineRow.module.css';

function FineRow({
    index,
    title,
    law,
    description,
    amount,
}: {
    index: number;
    title: string;
    law: string;
    description: string;
    amount: string;
}) {
    return (
        <div className={styles.row}>
            <div className={styles.main}>
                <div className={styles.title}>
                    {index}. {title}
                </div>
                <div className={styles.law}>{law}</div>
                <div className={styles.description}>{description}</div>
            </div>
            <div className={styles.amount}>{amount}</div>
        </div>
    );
}

export { FineRow };