import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import { ApiError, NetworkError } from '../../../shared/api/client';

type AuthField = 'firstName' | 'email' | 'password';
export type FieldErrors = Partial<Record<AuthField, string>>;

/** Maps schema issues and API failures to en.json copy for the auth forms. */
export const useFormErrors = () => {
  const { t } = useTranslation();

  const fromZod = (error: z.ZodError): FieldErrors => {
    const out: FieldErrors = {};
    for (const issue of error.issues) {
      const field = issue.path[0] as AuthField;
      if (out[field]) continue;
      if (field === 'email') out.email = t('auth.errors.email');
      else if (field === 'password')
        out.password =
          issue.code === 'too_small' && issue.minimum === 1
            ? t('auth.errors.passwordRequired')
            : t('auth.errors.passwordTooShort');
      else if (field === 'firstName')
        out.firstName =
          issue.code === 'too_big'
            ? t('auth.errors.firstNameTooLong')
            : t('auth.errors.firstNameRequired');
    }
    return out;
  };

  /** Field errors for a failed request, or a form-level message (banner) when none applies. */
  const fromRequest = (error: unknown): { fields: FieldErrors; banner: string | null } => {
    if (error instanceof ApiError) {
      if (error.code === 'email_taken')
        return { fields: { email: t('auth.errors.emailTaken') }, banner: null };
      if (error.code === 'invalid_credentials')
        return { fields: {}, banner: t('auth.login.invalid') };
      if (error.code === 'validation' && error.fields) {
        const fields: FieldErrors = {};
        for (const key of Object.keys(error.fields))
          fields[key as AuthField] = t('auth.errors.invalid');
        return { fields, banner: null };
      }
    }
    if (error instanceof NetworkError) return { fields: {}, banner: t('errors.network') };
    return { fields: {}, banner: t('errors.generic') };
  };

  return { fromZod, fromRequest };
};
