'use client';

import styles from './ConfirmDialog.module.css';

type ConfirmDialogProps = {
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    isBusy?: boolean;
};

function ConfirmDialog({
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    isBusy = false,
}: ConfirmDialogProps) {
    return (
        <div
            className={styles.overlay}
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className={styles.box} role="alertdialog" aria-modal="true">
                <p className={styles.message}>{message}</p>
                <div className={styles.row}>
                    <button type="button" className={styles.cancel} onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={styles.confirm}
                        onClick={onConfirm}
                        disabled={isBusy}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { ConfirmDialog };
