export function formatPrice(value: number, decimals: number): string {
  return value.toFixed(decimals)
}

export function formatUnits(units: number): string {
  return units >= 1_000 ? `${units / 1_000}k` : String(units)
}

export function formatPl(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

export function formatSignedPct(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
