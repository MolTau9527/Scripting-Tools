/**
 * 快捷指令入口
 *
 * 支持的参数 (Intent.shortcutParameter):
 * - "clockin" 或 "打卡": 执行打卡操作
 * - "check" 或 "检测": 执行检测并发送通知（如果需要）
 * - "status" 或 "状态": 返回当前状态信息
 * - "steps" 或 "步数": 返回步数信息
 */

import { Intent, Script } from "scripting"
import { CONFIG } from "./utils/constants"
import { formatTime, formatRelativeTime } from "./utils/format"
import { checkAndNotify } from "./utils/check"
import { doClockin } from "./utils/clockin"
import { getStepCount, isHealthAvailable } from "./utils/health"
import { getData } from "./utils/storage"

// 有效的操作指令
const VALID_ACTIONS = new Set(["打卡", "clockin", "check", "检测", "status", "状态", "steps", "步数"])

// 解析参数值
function parseParam(): string {
  const param = Intent.shortcutParameter
  if (!param) return ""

  if (param.type === "text") {
    return String(param.value).toLowerCase().trim()
  }

  if (param.type === "json") {
    const val = param.value as unknown
    if (typeof val === "string") {
      return val.toLowerCase().trim()
    }

    if (typeof val === "object" && val !== null) {
      const obj = val as Record<string, unknown>

      // 检查键名或值是否是有效操作
      for (const [key, value] of Object.entries(obj)) {
        const k = String(key).toLowerCase().trim()
        if (VALID_ACTIONS.has(k)) return k

        if (value) {
          const v = String(value).toLowerCase().trim()
          if (VALID_ACTIONS.has(v)) return v
        }
      }

      // 尝试常见键名
      const action = obj.action ?? obj.param ?? obj.command ?? obj.cmd ?? obj.type ?? obj["操作"] ?? obj["参数"]
      if (action) return String(action).toLowerCase().trim()

      // 取第一个值
      const firstValue = Object.values(obj)[0]
      if (firstValue) return String(firstValue).toLowerCase().trim()
    }
  }

  return ""
}

// 处理打卡
async function handleClockin(): Promise<string> {
  const result = await doClockin()
  return `打卡成功！\n时间：${formatTime(result.lastTime)}`
}

// 处理状态查询
function handleStatus(): string {
  const data = getData()
  const lastMs = data.lastTime

  if (!lastMs) return "暂无打卡记录"

  const diff = Date.now() - lastMs
  const thresholdMs = CONFIG.ALERT_AFTER_DAYS * 24 * 60 * 60 * 1000
  const isTimeout = diff > thresholdMs

  return [
    `上次打卡：${formatRelativeTime(lastMs)}`,
    `具体时间：${formatTime(lastMs)}`,
    `状态：${isTimeout ? "已超时" : "正常"}`,
  ].join("\n")
}

// 处理步数查询
async function handleSteps(): Promise<string> {
  if (!isHealthAvailable()) return "健康数据不可用"

  const data = getData()
  const healthEnabled = data.healthCheckEnabled
  const days = data.healthCheckDays || 1
  const steps = await getStepCount(days)

  if (steps === -1) return "获取步数失败，请检查健康授权"

  const lines = [
    `最近 ${days} 天步数：${steps}`,
    `健康检测：${healthEnabled ? "已启用" : "未启用"}`,
  ]

  if (healthEnabled && steps === 0) {
    lines.push("警告：步数为0，可能需要关注！")
  }

  return lines.join("\n")
}

// 主函数
async function main(): Promise<string> {
  const param = parseParam()

  switch (param) {
    case "clockin":
    case "打卡":
      return handleClockin()

    case "check":
    case "检测":
      return (await checkAndNotify()).message

    case "status":
    case "状态":
      return handleStatus()

    case "steps":
    case "步数":
      return handleSteps()

    default: {
      const result = await checkAndNotify()
      const rawParam = Intent.shortcutParameter
      const debugInfo = `[调试] 参数类型: ${rawParam?.type || "无"}, 解析值: "${param}"`
      return `检测完成\n${result.message}\n\n${debugInfo}`
    }
  }
}

// 执行并返回结果
main()
  .then(result => Intent.text(result))
  .catch(error => Intent.text(`执行失败：${error.message || error}`))
  .finally(() => Script.exit())
