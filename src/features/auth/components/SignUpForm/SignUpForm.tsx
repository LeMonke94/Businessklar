'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { signUpSchema, type SignUpInput } from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { AuthErrorCode } from '@/features/auth/types';
import styles from './SignUpForm.module.css';

function SignUpForm({ locale }: { locale: string }) {
    const t = useTranslations('auth');
    const router = useRouter();
    const { signUp, isSigningUp } = useAuth();
    const [serverError, setServerError] = useState<AuthErrorCode | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpInput) => {
        setServerError(null);
        const result = await signUp(data);

        if (result.ok) {
            router.push(`/${locale}/dashboard`);
        } else {
            setServerError(result.error.code);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
                label={t('signUp.emailLabel')}
                type="email"
                autoComplete="email"
                error={errors.email ? t('validation.emailInvalid') : undefined}
                {...register('email')}
            />

            <Input
                label={t('signUp.passwordLabel')}
                type="password"
                autoComplete="new-password"
                hint={t('signUp.passwordHint')}
                error={errors.password ? t('validation.passwordTooShort') : undefined}
                {...register('password')}
            />

            <Input
                label={t('signUp.nameLabel')}
                type="text"
                autoComplete="name"
                error={errors.name ? t('validation.nameTooLong') : undefined}
                {...register('name')}
            />

            {serverError && (
                <p className={styles.serverError}>{t(`errors.${serverError}`)}</p>
            )}

            <Button type="submit">
                {isSigningUp ? t('signUp.submitting') : t('signUp.submit')}
            </Button>
        </form>
    );
}

export { SignUpForm };