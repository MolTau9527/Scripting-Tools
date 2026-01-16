import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"
import { STORAGE_KEYS } from "./utils/constants"

// 获取今日日期字符串 (YYYY-MM-DD)
function getTodayDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

// 小组件打卡 Intent
export const WidgetClockInIntent = AppIntentManager.register({
  name: "WidgetClockInIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async () => {
    Storage.set(STORAGE_KEYS.LAST_TIME, String(Date.now()))
    Storage.set(STORAGE_KEYS.TODAY_CLOCKIN_DATE, getTodayDateString())
    Widget.reloadAll()
    return { success: true }
  },
})
