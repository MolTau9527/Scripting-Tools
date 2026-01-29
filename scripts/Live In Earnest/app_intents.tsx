import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"
import { getTodayDateString, updateData } from "./utils/storage"

// 小组件打卡 Intent
export const WidgetClockInIntent = AppIntentManager.register({
  name: "WidgetClockInIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async () => {
    updateData({
      lastTime: Date.now(),
      todayClockinDate: getTodayDateString(),
    })
    Widget.reloadAll()
    return { success: true }
  },
})
