// 统一存储管理模块 - 所有数据使用 JSON 格式存储在一个对象中

const STORAGE_KEY = "live_earnest_data"

// 数据结构定义
export interface AppData {
  // 打卡相关
  lastTime: number | null           // 上次打卡时间戳
  todayClockinDate: string | null   // 今日打卡日期 (YYYY-MM-DD)
  lastAutoDate: string | null       // 上次自动打卡日期

  // 通知相关
  notifyType: string                // 通知类型: bark, dingtalk, pushplus, serverchan, message
  notifyUrl: string                 // 通知地址/Token
  notifyTitle: string               // 自定义通知标题
  notifyBody: string                // 自定义通知内容
  lastAlert: number | null          // 上次发送提醒的时间戳
  lastHealthAlert: number | null    // 上次发送健康提醒的时间戳

  // 健康检测相关
  healthCheckEnabled: boolean       // 是否启用健康检测
  healthCheckDays: number           // 检测天数
}

// 默认数据
const DEFAULT_DATA: AppData = {
  lastTime: null,
  todayClockinDate: null,
  lastAutoDate: null,
  notifyType: "bark",
  notifyUrl: "",
  notifyTitle: "",
  notifyBody: "",
  lastAlert: null,
  lastHealthAlert: null,
  healthCheckEnabled: false,
  healthCheckDays: 1,
}

// 读取所有数据
export function getData(): AppData {
  try {
    const raw = Storage.get(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(String(raw))
    return { ...DEFAULT_DATA, ...parsed }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

// 保存所有数据
export function setData(data: AppData): void {
  Storage.set(STORAGE_KEY, JSON.stringify(data))
}

// 更新部分数据
export function updateData(partial: Partial<AppData>): AppData {
  const current = getData()
  const updated = { ...current, ...partial }
  setData(updated)
  return updated
}

// 获取单个字段
export function getField<K extends keyof AppData>(key: K): AppData[K] {
  return getData()[key]
}

// 设置单个字段
export function setField<K extends keyof AppData>(key: K, value: AppData[K]): void {
  updateData({ [key]: value } as Partial<AppData>)
}

// 重置所有数据
export function resetData(): void {
  setData({ ...DEFAULT_DATA })
}

// 获取今日日期字符串 (YYYY-MM-DD)
export function getTodayDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}
