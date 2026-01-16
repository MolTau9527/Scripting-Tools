import { Widget, VStack, HStack, Text, Circle, ZStack, Button, Color } from "scripting"
import { getStatus, getColors } from "./utils/status"
import { formatDate } from "./utils/format"
import { WidgetClockInIntent } from "./app_intents"
import { getTodayStepCount } from "./utils/health"

const STEPS_CACHE_KEY = "live_earnest_cached_steps"

function getCachedSteps(): number {
  const cached = Storage.get(STEPS_CACHE_KEY)
  return cached ? Number(cached) : 0
}

async function updateStepsCache() {
  const steps = await getTodayStepCount()
  if (steps >= 0) Storage.set(STEPS_CACHE_KEY, String(steps))
}

function VerticalText({ text, color }: { text: string; color: Color }) {
  return (
    <VStack spacing={6} frame={{ maxHeight: Infinity }}>
      {[...text].map((char, i) => (
        <Text key={i} font="subheadline" fontWeight="medium" foregroundStyle={color}>{char}</Text>
      ))}
    </VStack>
  )
}

function SmallWidget() {
  const { status, text, subtext } = getStatus()
  const colors = getColors(status)
  const steps = getCachedSteps()

  return (
    <Button intent={WidgetClockInIntent({})} buttonStyle="plain">
      <HStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background="systemBackground" padding={10} spacing={6}>
        <VerticalText text="活着打卡" color="tertiaryLabel" />
        <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} spacing={6}>
          <Text font="subheadline" foregroundStyle="tertiaryLabel">{formatDate()}</Text>
          <ZStack>
            <Circle fill={colors.light} frame={{ width: 70, height: 70 }} />
            <Circle fill={colors.light} frame={{ width: 56, height: 56 }} />
            <Circle fill={colors.main} frame={{ width: 44, height: 44 }} />
            <Text font={status === "timeout" ? "subheadline" : "title2"} fontWeight="bold" foregroundStyle="white">
              {text}
            </Text>
          </ZStack>
          <Text font="subheadline" foregroundStyle="secondaryLabel">{subtext}</Text>
          <HStack spacing={3}>
            <Text font="subheadline" foregroundStyle="tertiaryLabel">今日</Text>
            <Text font="headline" fontWeight="semibold" foregroundStyle={colors.main}>{steps}</Text>
            <Text font="subheadline" foregroundStyle="tertiaryLabel">步</Text>
          </HStack>
        </VStack>
        <VerticalText text={status === "ok" ? "活着呢" : "活着吗"} color={colors.main} />
      </HStack>
    </Button>
  )
}

function CircularWidget() {
  const { status, text } = getStatus()
  const colors = getColors(status)

  return (
    <Button intent={WidgetClockInIntent({})} buttonStyle="plain">
      <ZStack>
        <Circle fill={colors.main} />
        <Text font={status === "timeout" ? "caption2" : "caption"} fontWeight="bold" foregroundStyle="white">
          {status === "timeout" ? "?" : text}
        </Text>
      </ZStack>
    </Button>
  )
}

function UnsupportedWidget() {
  return (
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background="systemBackground" spacing={8}>
      <Text font="title3" fontWeight="bold" foregroundStyle="secondaryLabel">不可用</Text>
      <Text font="caption" foregroundStyle="tertiaryLabel">请更换为小组件</Text>
    </VStack>
  )
}

// 入口
updateStepsCache()

const REFRESH_INTERVAL = 30 * 60 * 1000 // 30分钟
const widgetConfig = { policy: "after" as const, date: new Date(Date.now() + REFRESH_INTERVAL) }

const widgetMap: Record<string, JSX.Element> = {
  accessoryCircular: <CircularWidget />,
  systemSmall: <SmallWidget />,
}

Widget.present(widgetMap[Widget.family] ?? <UnsupportedWidget />, widgetConfig)
