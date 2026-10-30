export const formatPKR = (value: number) =>
  `PKR ${Math.round(value).toLocaleString('en-PK')}`;

export const formatPriceShort = (value: number) => {
  if (value >= 10_000_000) return `PKR ${(value / 10_000_000).toFixed(2)} Crore`;
  if (value >= 100_000) return `PKR ${(value / 100_000).toFixed(1)} Lakh`;
  return formatPKR(value);
};

export const formatMileage = (value: number) => `${value.toLocaleString('en-PK')} km`;

export const formatNumber = (value: number) => value.toLocaleString('en-PK');

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export const timeAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months <= 1 ? '1 month ago' : `${months} months ago`;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const estimateMonthly = (price: number, downPaymentPct = 0.2, years = 5, annualRate = 0.17) => {
  const principal = price * (1 - downPaymentPct);
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
};
