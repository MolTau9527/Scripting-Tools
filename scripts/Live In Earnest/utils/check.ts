import { CONFIG } from "./constants"
import { formatTime } from "./format"
import { sendNotify } from "./notify"
import { checkZeroSteps } from "./health"
import { isTodayCheckedIn } from "./status"
import { getData, updateData } from "./storage"

type CheckResult = { sent: boolean; message: string }

const MIN_INTERVAL_MS = CONFIG.MIN_ALERT_INTERVAL_HOURS * 60 * 60 * 1000
const THRESHOLD_MS = CONFIG.ALERT_AFTER_DAYS * 24 * 60 * 60 * 1000

function isIntervalExpired(lastAlert: number | null, now: number): boolean {
  if (!lastAlert) return true
  return now - lastAlert >= MIN_INTERVAL_MS
}

/**
 * 健康检测通知条件：
 * 1. 启用健康检测
 * 2. 今日未打卡
 * 3. 距离上次打卡超过24小时
 * 4. 步数为0
 */
async function checkHealthAndNotify(now: number): Promise<CheckResult> {
  const data = getData()

  // 检查是否启用健康检测
  if (!data.healthCheckEnabled) {
    return { sent: false, message: "健康检测未启用" }
  }

  // 检查今日是否已打卡
  if (isTodayCheckedIn()) {
    return { sent: false, message: "今日已打卡" }
  }

  // 检查是否超过24小时未打卡
  if (!data.lastTime) {
    return { sent: false, message: "无打卡记录" }
  }

  if ((now - data.lastTime) <= THRESHOLD_MS) {
    return { sent: false, message: "未超过24小时" }
  }

  // 检查提醒间隔
  if (!isIntervalExpired(data.lastHealthAlert, now)) {
    return { sent: false, message: "健康提醒间隔未到" }
  }

  // 检查步数是否为0
  const days = data.healthCheckDays || 1
  if (!(await checkZeroSteps(days))) {
    return { sent: false, message: "步数正常" }
  }

  if (!data.notifyUrl) {
    return { sent: false, message: "未配置通知" }
  }

  const ok = await sendNotify(data.notifyType, data.notifyUrl, {
    title: data.notifyTitle || "健康警告",
    body: `今日未打卡且最近 ${days} 天步数为 0，请确认是否安全！`,
  })

  if (ok) {
    updateData({ lastHealthAlert: now })
    return { sent: true, message: "健康通知已发送" }
  }

  return { sent: false, message: "健康通知发送失败" }
}

export async function checkAndNotify(): Promise<CheckResult> {
  const now = Date.now()
  const data = getData()

  // 优先检查健康数据
  const healthResult = await checkHealthAndNotify(now)
  if (healthResult.sent) return healthResult

  // 检查打卡超时（今日未打卡 + 超过24小时）
  if (isTodayCheckedIn()) {
    return { sent: false, message: "今日已打卡" }
  }

  if (!data.lastTime) return { sent: false, message: "无打卡记录" }

  const diff = now - data.lastTime
  if (diff <= THRESHOLD_MS) return { sent: false, message: "未超时" }
  if (!isIntervalExpired(data.lastAlert, now)) return { sent: false, message: "提醒间隔未到" }
  if (!data.notifyUrl) return { sent: false, message: "未配置通知" }

  const hours = Math.floor(diff / 3600000)

  const ok = await sendNotify(data.notifyType, data.notifyUrl, {
    title: data.notifyTitle || "活着吗？",
    body: data.notifyBody || `已 ${hours} 小时未打卡，上次：${formatTime(data.lastTime)}`,
  })

  if (ok) {
    updateData({ lastAlert: now })
    return { sent: true, message: "通知已发送" }
  }

  return { sent: false, message: "发送失败" }
}
