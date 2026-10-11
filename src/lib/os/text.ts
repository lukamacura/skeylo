/** Srpska množina: 1 projekat, 2 projekta, 5 projekata (11–14 su "many"). */
export function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10;
  const t = n % 100;
  return d === 1 && t !== 11
    ? one
    : d >= 2 && d <= 4 && (t < 12 || t > 14)
      ? few
      : many;
}
