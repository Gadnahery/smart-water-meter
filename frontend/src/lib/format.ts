/** TSh amount, e.g. formatCurrency(1234.5) -> "TSh 1,235" */
export function formatCurrency(amount: number): string {
  return `TSh ${Math.round(amount).toLocaleString()}`
}

/** Litre volume, e.g. formatLitres(1234.5) -> "1,235 L" */
export function formatLitres(litres: number): string {
  return `${Math.round(litres).toLocaleString()} L`
}
