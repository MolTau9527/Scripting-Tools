/**
 * 健康数据检测工具
 */

export function isHealthAvailable(): boolean {
  return Health.isHealthDataAvailable
}

export async function requestHealthAuthorization(): Promise<boolean> {
  if (!Health.isHealthDataAvailable) return false
  try {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
    await Health.queryQuantitySamples("stepCount", { startDate, endDate, limit: 1 })
    return true
  } catch {
    return false
  }
}

async function queryStepCount(startDate: Date, endDate: Date): Promise<number> {
  const unit = HealthUnit.count()
  const statistics = await Health.queryStatistics("stepCount", {
    startDate,
    endDate,
    strictStartDate: true,
    strictEndDate: false,
    statisticsOptions: ["cumulativeSum", "separateBySource"],
  })

  if (!statistics) return 0

  // 多数据源时取最大值（避免重复计算）
  if (statistics.sources?.length) {
    return Math.max(...statistics.sources.map(source => statistics.sumQuantity(unit, source) ?? 0))
  }

  return Math.floor(statistics.sumQuantity(unit) ?? 0)
}

function createDateRange(daysAgo: number): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo + 1)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)
  return { startDate, endDate }
}

export async function getStepCount(days: number): Promise<number> {
  if (!Health.isHealthDataAvailable) return -1
  try {
    const { startDate, endDate } = createDateRange(days)
    return await queryStepCount(startDate, endDate)
  } catch {
    return -1
  }
}

export async function getTodayStepCount(): Promise<number> {
  if (!Health.isHealthDataAvailable) return -1
  try {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    return await queryStepCount(startDate, new Date())
  } catch {
    return -1
  }
}

export async function checkZeroSteps(days: number): Promise<boolean> {
  return (await getStepCount(days)) === 0
}
