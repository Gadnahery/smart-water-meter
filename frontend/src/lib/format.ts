/** TSh amount, e.g. formatCurrency(1234.5) -> "TSh 1,235" */
export function formatCurrency(amount: number): string {
  return `TSh ${Math.round(amount).toLocaleString()}`
}

/** Litre volume, e.g. formatLitres(1234.5) -> "1,235 L" */
export function formatLitres(litres: number): string {
  const safe = Number.isFinite(litres) ? litres : 0

  if (Math.abs(safe) < 10) {
    return `${safe.toFixed(1).replace(/\.0$/, '').toLocaleString()} L`
  }

  if (Math.abs(safe) >= 1000) {
    const inKiloLitres = safe / 1000
    return `${inKiloLitres.toFixed(1).replace(/\.0$/, '').toLocaleString()} kL`
  }

  return `${Math.round(safe).toLocaleString()} L`
}
