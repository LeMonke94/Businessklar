'use client';

import { useState } from 'react';
import styles from './ShareDialog.module.css';

type ShareDialogProps = {
    title: string;
    url: string;
    copyLabel: string;
    copiedLabel: string;
    closeLabel: string;
    onClose: () => void;
};

function ShareDialog({ title, url, copyLabel, copiedLabel, closeLabel, onClose }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable (insecure context / permissions) — the
            // URL is shown in full above, so the user can still select and copy.
        }
    };

    return (
        <div
            className={styles.overlay}
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className={styles.box} role="dialog" aria-modal="true" aria-label={title}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.url}>{url}</p>
                <div className={styles.row}>
                    <button type="button" className={styles.copy} onClick={handleCopy}>
                        {copied ? copiedLabel : copyLabel}
                    </button>
                    <button type="button" className={styles.close} onClick={onClose}>
                        {closeLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { ShareDialog };
