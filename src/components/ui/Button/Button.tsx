import Link from 'next/link';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
    variant?: ButtonVariant;
    href?: string;
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
};

function Button({ variant = 'primary', href, children, onClick, type = 'button' }: ButtonProps) {
    const className = `${styles.button} ${styles[variant]}`;

    // If href is provided, render as a Link. Otherwise as a button.
    if (href) {
        return (
            <Link href={href} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} className={className}>
            {children}
        </button>
    );
}

export { Button };
export type { ButtonVariant };