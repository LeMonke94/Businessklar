'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { signInSchema, type SignInInput } from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { AuthErrorCode } from '@/features/auth/types';
import styles from './SignInForm.module.css';

function SignInForm({ locale }: { locale: string }) {
    const t = useTranslations('auth');
    const router = useRouter();
    const { signIn, isSigningIn } = useAuth();
    const [serverError, setServerError] = useState<AuthErrorCode | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInInput) => {
        setServerError(null);
        const result = await signIn(data);

        if (result.ok) {
            router.push(`/${locale}/dashboard`);
        } else {
            setServerError(result.error.code);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
                label={t('signIn.emailLabel')}
                type="email"
                autoComplete="email"
                error={errors.email ? t('validation.emailInvalid') : undefined}
                {...register('email')}
            />

            <Input
                label={t('signIn.passwordLabel')}
                type="password"
                autoComplete="current-password"
                error={errors.password ? t('validation.passwordTooShort') : undefined}
                {...register('password')}
            />

            {serverError && (
                <p className={styles.serverError}>{t(`errors.${serverError}`)}</p>
            )}

            <Button type="submit">
                {isSigningIn ? t('signIn.submitting') : t('signIn.submit')}
            </Button>
        </form>
    );
}

export { SignInForm };