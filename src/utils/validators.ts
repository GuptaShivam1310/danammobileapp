import * as yup from 'yup';
import i18n from '../localization/i18n';

export const emailSchema = yup
  .string()
  .trim()
  .email(i18n.t('validation.emailInvalidLong'))
  .required(i18n.t('validation.emailRequired'));

export const passwordSchema = yup
  .string()
  .min(6, i18n.t('validation.passwordMinLength'))
  .required(i18n.t('validation.passwordRequired'));

export const loginValidationSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});
