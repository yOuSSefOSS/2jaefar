import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatNumber = (value: number, decimals = 3): string =>
  Number.isFinite(value) ? value.toFixed(decimals) : '—';
