import { Color } from "scripting"
import { CONFIG, COLORS } from "./constants"
import { getData, getTodayDateString } from "./storage"
import { formatShortRelativeTime } from "./format"

export type Status = "none" | "timeout" | "ok"

const THRESHOLD_MS = CONFIG.ALERT_AFTER_DAYS * 24 * 60 * 60 * 1000

// 检查今日是否已打卡
export function isTodayCheckedIn(): boolean {
  const data = getData()
  return data.todayClockinDate === getTodayDateString()
}

// 获取上次打卡时间
function getLastTime(): number | null {
  return getData().lastTime
}

// 检查是否超过24小时未打卡
function isTimeoutExpired(lastMs: number): boolean {
  return Date.now() - lastMs > THRESHOLD_MS
}

export function getStatus() {
  const lastMs = getLastTime()
  const todayCheckedIn = isTodayCheckedIn()

  // 今日已打卡
  if (todayCheckedIn && lastMs) {
    return { status: "ok" as const, lastTime: lastMs, text: "活着", subtext: formatShortRelativeTime(lastMs) }
  }

  // 从未打卡
  if (!lastMs) {
    return { status: "none" as const, lastTime: null, text: "签到", subtext: "未签到" }
  }

  // 今日未打卡，检查是否超时
  if (isTimeoutExpired(lastMs)) {
    const hours = Math.floor((Date.now() - lastMs) / 3600000)
    return { status: "timeout" as const, lastTime: lastMs, text: "还活着吗？", subtext: `${hours}h 未签到` }
  }

  // 今日未打卡但未超时（24小时内有打卡记录）
  return { status: "none" as const, lastTime: lastMs, text: "签到", subtext: formatShortRelativeTime(lastMs) }
}

export function checkTimeoutStatus() {
  const lastTime = getLastTime()
  const todayCheckedIn = isTodayCheckedIn()
  const isTimeout = lastTime ? isTimeoutExpired(lastTime) : true
  return { isTimeout, lastTime, todayCheckedIn }
}

const COLOR_MAP: Record<Status, { main: Color; light: Color }> = {
  none: { main: COLORS.blue, light: COLORS.blueLight },
  timeout: { main: COLORS.red, light: COLORS.redLight },
  ok: { main: COLORS.green, light: COLORS.greenLight },
}

export function getColors(status: Status) {
  return COLOR_MAP[status]
}
