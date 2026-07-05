// src/app/_lib/format.ts
//
// Centralized formatting helpers so the UI is consistent and we don't
// repeat Intl boilerplate everywhere.

export function formatMoney(cents: number, currency: string = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function pct(reserved: number, goal: number) {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((reserved / goal) * 100));
}

export function daysLeft(deadline: string | number | Date): number {
  const d = new Date(deadline).getTime();
  const now = Date.now();
  const diff = d - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function plural(n: number, singular: string, pluralForm?: string) {
  if (n === 1) return `${n} ${singular}`;
  return `${n} ${pluralForm ?? singular + "s"}`;
}
