const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleString()
}

export function formatDate(includeYear = false): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekday = WEEKDAYS[now.getDay()]
  if (includeYear) {
    return `${now.getFullYear()}年${month}月${day}日 ${weekday}`
  }
  return `${month}月${day}日 ${weekday}`
}

export function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} 天前`
  if (hours > 0) return `${hours} 小时前`
  if (minutes > 0) return `${minutes} 分钟前`
  return "刚刚"
}

export function formatShortRelativeTime(ms: number): string {
  const diff = Date.now() - ms
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return hours > 0 ? `${hours}h前` : `${mins}m前`
}
