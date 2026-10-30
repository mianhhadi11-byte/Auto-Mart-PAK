export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isPakPhone = (value: string) => {
  const digits = value.replace(/[\s-]/g, '');
  return /^(\+92|0092|92|0)?3\d{9}$/.test(digits);
};

export const required = (value: string, label: string) =>
  value.trim() ? '' : `${label} is required.`;

export const minLength = (value: string, length: number, label: string) =>
  value.trim().length >= length ? '' : `${label} must be at least ${length} characters.`;

export const validateEmail = (value: string) =>
  isEmail(value) ? '' : 'Enter a valid email address.';

export const validatePhone = (value: string) =>
  isPakPhone(value) ? '' : 'Enter a valid Pakistani mobile number, e.g. 0300 1234567.';

export const validatePrice = (value: number) =>
  value >= 100_000 && value <= 100_000_000 ? '' : 'Price must be between PKR 1 Lakh and PKR 10 Crore.';

export const validateYear = (value: number) =>
  value >= 2000 && value <= 2026 ? '' : 'Year must be between 2000 and 2026.';

export const validateMileage = (value: number) =>
  value >= 0 && value <= 1_000_000 ? '' : 'Mileage must be between 0 and 1,000,000 km.';

export const validatePassword = (value: string) =>
  value.length >= 6 ? '' : 'Password must be at least 6 characters.';
