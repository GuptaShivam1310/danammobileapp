import { emailSchema, loginValidationSchema, passwordSchema } from '../../src/utils/validators';

jest.mock('../../src/localization/i18n', () => ({
  t: (key: string) => key,
}));

describe('validators', () => {
  it('validates email schema', async () => {
    await expect(emailSchema.validate('user@example.com')).resolves.toBe('user@example.com');
    await expect(emailSchema.validate('bad-email')).rejects.toThrow('validation.emailInvalidLong');
  });

  it('validates password schema', async () => {
    await expect(passwordSchema.validate('secret1')).resolves.toBe('secret1');
    await expect(passwordSchema.validate('123')).rejects.toThrow('validation.passwordMinLength');
  });

  it('validates login schema', async () => {
    await expect(
      loginValidationSchema.validate({ email: 'user@example.com', password: 'secret1' }),
    ).resolves.toEqual({ email: 'user@example.com', password: 'secret1' });

    await expect(
      loginValidationSchema.validate({ email: '', password: '' }),
    ).rejects.toBeTruthy();
  });
});
