import { Widget } from "scripting"
import { CONFIG } from "./constants"
import { formatTime } from "./format"
import { sendNotify } from "./notify"
import { getData, updateData, getTodayDateString } from "./storage"

function saveClockinTime(time: number = Date.now()) {
  updateData({
    lastTime: time,
    todayClockinDate: getTodayDateString(),
  })
}

export async function doClockin(): Promise<{ ok: boolean; lastTime: number }> {
  const now = Date.now()
  saveClockinTime(now)

  if (CONFIG.NOTIFY_ON_CLOCKIN) {
    const data = getData()
    if (data.notifyUrl) {
      await sendNotify(data.notifyType, data.notifyUrl, {
        title: data.notifyTitle || "还活着",
        body: data.notifyBody || `已记录：${formatTime(now)}`,
      })
    }
  }

  return { ok: true, lastTime: now }
}

export function handleWidgetClockin(action?: string) {
  if (action === "clockin") {
    saveClockinTime()
    Widget.reloadAll()
  }
}

export function autoClockIn(): { done: boolean; message: string } {
  const today = new Date().toDateString()
  const data = getData()

  if (data.lastAutoDate === today) {
    return { done: false, message: "今日已自动打卡" }
  }

  saveClockinTime()
  updateData({ lastAutoDate: today })
  Widget.reloadAll()

  return { done: true, message: "自动打卡成功" }
}
