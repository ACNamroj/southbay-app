export const PASSWORD_POLICY_REGEX =
  /^(?=.*\p{Lu})(?=.*\p{Nd})(?=.*[^\p{L}\p{Nd}]).{8,}$/u;

export type PasswordPolicyStatus = {
  length: boolean;
  uppercase: boolean;
  digit: boolean;
  special: boolean;
};

export const evaluatePasswordPolicy = (
  password: string,
): PasswordPolicyStatus => ({
  length: password.length >= 8,
  uppercase: /\p{Lu}/u.test(password),
  digit: /\p{Nd}/u.test(password),
  special: /[^\p{L}\p{Nd}]/u.test(password),
});

export const PASSWORD_POLICY_REQUIREMENTS = [
  { key: 'length', label: '8 caracteres' },
  { key: 'uppercase', label: '1 mayúscula' },
  { key: 'digit', label: '1 dígito' },
  { key: 'special', label: '1 carácter especial' },
] as const;
