export function toYmd(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function rangeLastDays(days = 7) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (days - 1))
  return { desde: toYmd(start), hasta: toYmd(end) }
}

