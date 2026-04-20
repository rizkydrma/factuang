import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FormatCurrencyOptions = {
  withSymbol?: boolean;
};

export const formatCurrency = (
  val: number,
  options: FormatCurrencyOptions = {},
) => {
  const { withSymbol = true } = options;
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(val)
    .replace(',00', '');

  if (withSymbol) return formatted;

  return formatted.replace(/^Rp\s?/, '');
};
