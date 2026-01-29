import {
  Navigation, useState, useEffect, useMemo, useObservable,
  VStack, HStack, Text, Button, Section, TextField, Picker, Spacer, List, Circle, ZStack, Image, Script, Toggle,
} from "scripting"
import { CONFIG } from "./utils/constants"
import { formatDate, formatTime, formatRelativeTime } from "./utils/format"
import { sendNotify, isMessageAvailable } from "./utils/notify"
import { checkTimeoutStatus, getColors, Status } from "./utils/status"
import { doClockin, handleWidgetClockin, autoClockIn } from "./utils/clockin"
import { checkAndNotify } from "./utils/check"
import { isHealthAvailable, requestHealthAuthorization, getStepCount } from "./utils/health"
import { DanmakuLayer } from "./components/DanmakuLayer"
import { getData, updateData } from "./utils/storage"

// ==================== 页面信息配置 ====================
const SHORTCUT_URL = "https://www.icloud.com/shortcuts/66d54824056a4385a502fe4f3505430d"

const aboutSections = [
  { title: "什么是「活着打卡」？", content: "这是一款每日签到插件，通过每天点击签到来记录您的状态。如果超过设定时间未签到，系统将通过您配置的通知服务提醒您的紧急联系人。" },
  { title: "签到即同意", content: "当您使用本应用进行签到时，即表示您已阅读并同意我们的隐私政策和用户协议。" },
]

const privacySections = [
  { title: "数据收集", content: "本应用仅在本地存储您的签到时间记录，不会上传任何个人数据到服务器。" },
  { title: "通知服务", content: "如您配置了通知服务（如Bark、钉钉等），签到提醒将通过您配置的第三方服务发送，请参阅相应服务的隐私政策。" },
  { title: "数据安全", content: "所有数据均存储在您的设备本地，我们不会访问、收集或分享您的任何信息。" },
]

const agreementSections = [
  { title: "服务说明", content: "「活着打卡」是一款每日签到提醒插件，帮助您记录每日状态，并在长时间未签到时提醒您的紧急联系人。" },
  { title: "使用须知", content: "1. 请确保每日按时签到，超过设定时间未签到将触发提醒。\n2. 紧急联系人通知功能需要您自行配置通知服务。\n3. 本应用不对通知延迟或失败承担责任。" },
  { title: "免责声明", content: "本应用仅作为辅助提醒工具，不能替代专业的健康监测或紧急救援服务。" },
]

// ==================== 设置页面 ====================
function SettingsPage() {
  const dismiss = Navigation.useDismiss()
  const initialData = getData()
  const [notifyType, setNotifyType] = useState(initialData.notifyType)
  const [notifyUrl, setNotifyUrl] = useState(initialData.notifyUrl)
  const [notifyTitle, setNotifyTitle] = useState(initialData.notifyTitle)
  const [notifyBody, setNotifyBody] = useState(initialData.notifyBody)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [healthCheckEnabled, setHealthCheckEnabled] = useState(initialData.healthCheckEnabled)
  const [healthCheckDays, setHealthCheckDays] = useState(String(initialData.healthCheckDays))

  const notifyTypes = [
    { label: "Bark", value: "bark" },
    { label: "钉钉", value: "dingtalk" },
    { label: "PushPlus", value: "pushplus" },
    { label: "Server酱", value: "serverchan" },
    ...(isMessageAvailable() ? [{ label: "短信/iMessage", value: "message" }] : []),
  ]

  const placeholders: Record<string, string> = {
    bark: "https://api.day.app/your-key",
    dingtalk: "钉钉机器人 Webhook URL",
    pushplus: "PushPlus Token",
    serverchan: "Server酱 SendKey",
    message: "收件人手机号码或 iMessage 地址",
  }

  const dayOptions = [
    { label: "1 天", value: "1" },
    { label: "2 天", value: "2" },
    { label: "3 天", value: "3" },
    { label: "5 天", value: "5" },
    { label: "7 天", value: "7" },
  ]

  function saveSettings() {
    updateData({
      notifyType,
      notifyUrl,
      notifyTitle,
      notifyBody,
      healthCheckEnabled,
      healthCheckDays: parseInt(healthCheckDays) || 1,
    })
    setMessage("设置已保存")
    setTimeout(() => setMessage(""), 2000)
  }

  async function testNotify() {
    if (!notifyUrl) { setMessage("请先填写通知地址"); return }
    setIsLoading(true)
    const ok = await sendNotify(notifyType, notifyUrl, {
      title: notifyTitle || "测试通知",
      body: notifyBody || "如果你收到这条消息，说明配置正确！",
    })
    setMessage(ok ? "发送成功" : "发送失败")
    setIsLoading(false)
    setTimeout(() => setMessage(""), 2000)
  }

  async function handleHealthToggle(enabled: boolean) {
    if (enabled) {
      const authorized = await requestHealthAuthorization()
      if (!authorized) {
        setMessage("健康数据授权失败")
        setTimeout(() => setMessage(""), 2000)
        return
      }
    }
    setHealthCheckEnabled(enabled)
  }

  async function testHealthCheck() {
    setIsLoading(true)
    const days = parseInt(healthCheckDays) || 1
    const steps = await getStepCount(days)
    setMessage(steps === -1 ? "获取步数失败，请检查健康授权" : `最近 ${days} 天步数：${steps}`)
    setIsLoading(false)
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <List navigationTitle="设置" toolbar={{ topBarLeading: <Button title="完成" action={dismiss} /> }}>
      <Section header={<Text>通知设置</Text>} footer={<Text>配置通知后，超时未打卡时会收到提醒</Text>}>
        <Picker title="通知方式" value={notifyType} onChanged={setNotifyType}>
          {notifyTypes.map((t) => <Text key={t.value} tag={t.value}>{t.label}</Text>)}
        </Picker>
        <TextField title="通知地址" value={notifyUrl} onChanged={setNotifyUrl} prompt={placeholders[notifyType] || ""} />
      </Section>
      <Section header={<Text>自定义消息</Text>} footer={<Text>留空则使用默认内容</Text>}>
        <TextField title="消息标题" value={notifyTitle} onChanged={setNotifyTitle} prompt="默认：还活着" />
        <TextField title="消息内容" value={notifyBody} onChanged={setNotifyBody} prompt="默认：已记录：[时间]" />
      </Section>
      {isHealthAvailable() && (
        <Section header={<Text>健康检测</Text>} footer={<Text>通过步数判断是否还活着，连续指定天数步数为0时发送通知</Text>}>
          <Toggle title="启用步数检测" value={healthCheckEnabled} onChanged={handleHealthToggle} />
          {healthCheckEnabled && (
            <>
              <Picker title="检测天数" value={healthCheckDays} onChanged={setHealthCheckDays}>
                {dayOptions.map((d) => <Text key={d.value} tag={d.value}>{d.label}</Text>)}
              </Picker>
              <Button title="测试步数获取" action={testHealthCheck} />
            </>
          )}
        </Section>
      )}
      <Section>
        <Button title="保存设置" action={saveSettings} />
        <Button title={isLoading ? "发送中..." : "测试通知"} action={testNotify} />
      </Section>
      {message ? <Section><Text foregroundStyle="secondaryLabel">{message}</Text></Section> : null}
      <Section header={<Text>说明</Text>}>
        <VStack alignment="leading" spacing={8} padding={12}>
          <Text font="subheadline" foregroundStyle="secondaryLabel">1. 每天点击打卡按钮确认"活着"</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">2. 超过 {CONFIG.ALERT_AFTER_DAYS * 24} 小时未打卡将发送提醒</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">3. 提醒间隔最少 {CONFIG.MIN_ALERT_INTERVAL_HOURS} 小时</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">4. 可配合 iOS 自动化定时检查</Text>
          {isHealthAvailable() && <Text font="subheadline" foregroundStyle="secondaryLabel">5. 开启健康检测后，步数为0也会触发通知</Text>}
        </VStack>
      </Section>
    </List>
  )
}

// ==================== 信息页面 ====================
function InfoPage({ title, sections }: { title: string; sections: { title: string; content: string }[] }) {
  const dismiss = Navigation.useDismiss()
  return (
    <List navigationTitle={title} toolbar={{ topBarLeading: <Button title="关闭" action={dismiss} /> }}>
      <Section>
        <VStack alignment="leading" spacing={12} padding={16}>
          {sections.map((s, i) => (
            <VStack key={i} alignment="leading" spacing={4}>
              <Text font="headline" fontWeight="bold">{s.title}</Text>
              <Text font="subheadline" foregroundStyle="secondaryLabel">{s.content}</Text>
            </VStack>
          ))}
        </VStack>
      </Section>
    </List>
  )
}

// ==================== 使用方法页面 ====================
function UsagePage() {
  const dismiss = Navigation.useDismiss()
  return (
    <List navigationTitle="使用方法" toolbar={{ topBarLeading: <Button title="关闭" action={dismiss} /> }}>
      <Section header={<Text>小组件打卡（推荐）</Text>} footer={<Text>点击小组件直接打卡，无需打开应用</Text>}>
        <VStack alignment="leading" spacing={8} padding={{ vertical: 8 }}>
          <Text font="subheadline" foregroundStyle="secondaryLabel">1. 长按桌面空白处进入编辑模式</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">2. 点击左上角「+」添加小组件</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">3. 搜索「Scripting」</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">4. 选择「活着打卡」小组件</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">5. 点击小组件即可打卡</Text>
        </VStack>
      </Section>
      <Section header={<Text>手动打卡</Text>}>
        <Text>打开应用，点击主页中间的打卡按钮即可完成签到。</Text>
      </Section>
      <Section header={<Text>自动打卡（充电时）</Text>} footer={<Text>每天首次充电时自动打卡，会短暂打开应用</Text>}>
        <VStack alignment="leading" spacing={8} padding={{ vertical: 8 }}>
          <HStack spacing={4}>
            <Text font="subheadline" foregroundStyle="secondaryLabel">1. 安装</Text>
            <Button action={() => Safari.openURL(SHORTCUT_URL)}>
              <Text font="subheadline" foregroundStyle="link">快捷指令</Text>
            </Button>
          </HStack>
          <Text font="subheadline" foregroundStyle="secondaryLabel">2. 打开「快捷指令」App → 自动化</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">3. 点击右上角「+」新建自动化</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">4. 选择「充电器」→「已连接」</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">5. 选择「立即运行」</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">6. 添加操作 → 选择「活着打卡」快捷指令</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">7. 关闭「运行前询问」和「运行时通知」</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">8. 点击「完成」保存</Text>
        </VStack>
      </Section>
      <Section header={<Text>定时检查通知</Text>} footer={<Text>定时检查是否超时，超时则发送通知提醒</Text>}>
        <VStack alignment="leading" spacing={8} padding={{ vertical: 8 }}>
          <HStack spacing={4}>
            <Text font="subheadline" foregroundStyle="secondaryLabel">1. 安装</Text>
            <Button action={() => Safari.openURL(SHORTCUT_URL)}>
              <Text font="subheadline" foregroundStyle="link">快捷指令</Text>
            </Button>
          </HStack>
          <Text font="subheadline" foregroundStyle="secondaryLabel">2. 打开「快捷指令」App → 自动化</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">3. 点击右上角「+」新建自动化</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">4. 选择「特定时间」（如每天 9:00）</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">5. 选择「立即运行」</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">6. 添加操作 → 选择「活着打卡」快捷指令</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">7. 关闭「运行前询问」和「运行时通知」</Text>
          <Text font="subheadline" foregroundStyle="secondaryLabel">8. 点击「完成」保存</Text>
        </VStack>
      </Section>
      <Section header={<Text>自动检查</Text>}>
        <Text>每次打开应用时会自动检查是否超时，超时则发送通知。无需额外配置。</Text>
      </Section>
    </List>
  )
}

// ==================== 主页面 ====================
function MainPage() {
  const dismiss = Navigation.useDismiss()
  const [lastTime, setLastTime] = useState<number | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)
  const [todayCheckedIn, setTodayCheckedIn] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [todaySteps, setTodaySteps] = useState<number | null>(null)
  const [showPlusOne, setShowPlusOne] = useState(false)

  // 动画状态
  const pulseScale1 = useObservable(1)
  const pulseOpacity1 = useObservable(0.6)
  const pulseScale2 = useObservable(1)
  const pulseOpacity2 = useObservable(0.4)
  const plusOneOpacity = useObservable(0)
  const plusOneOffsetY = useObservable(0)

  useEffect(() => {
    const status = checkTimeoutStatus()
    setLastTime(status.lastTime)
    setIsTimeout(status.isTimeout)
    setTodayCheckedIn(status.todayCheckedIn)

    // 启动脉冲动画
    pulseScale1.setValue(1.5)
    pulseOpacity1.setValue(0)
    setTimeout(() => { pulseScale2.setValue(1.5); pulseOpacity2.setValue(0) }, 500)

    // 获取今日步数
    if (isHealthAvailable()) {
      getStepCount(1).then(steps => {
        if (steps >= 0) setTodaySteps(steps)
      })
    }
  }, [])

  const pulseAnimation1 = useMemo(() => ({
    scaleEffect: pulseScale1.value,
    opacity: pulseOpacity1.value,
    animation: { animation: Animation.easeOut(2).repeatForever(true), value: pulseScale1.value },
  }), [pulseScale1.value])

  const pulseAnimation2 = useMemo(() => ({
    scaleEffect: pulseScale2.value,
    opacity: pulseOpacity2.value,
    animation: { animation: Animation.easeOut(2).repeatForever(true), value: pulseScale2.value },
  }), [pulseScale2.value])

  const plusOneAnimation = useMemo(() => ({
    opacity: plusOneOpacity.value,
    offset: { x: 0, y: plusOneOffsetY.value },
    animation: { animation: Animation.easeOut(1.5), value: plusOneOpacity.value },
  }), [plusOneOpacity.value, plusOneOffsetY.value])

  async function handleClockin() {
    if (todayCheckedIn) return

    setIsPressed(true)
    const result = await doClockin()
    setLastTime(result.lastTime)
    setIsTimeout(false)
    setTodayCheckedIn(true)
    setTimeout(() => setIsPressed(false), 200)

    // 显示 +1天 动画
    setShowPlusOne(true)
    plusOneOpacity.setValue(1)
    plusOneOffsetY.setValue(0)
    setTimeout(() => {
      plusOneOpacity.setValue(0)
      plusOneOffsetY.setValue(-50)
    }, 100)
    setTimeout(() => setShowPlusOne(false), 1600)
  }

  // 修复状态判断：只有在有打卡记录且超时的情况下才显示红色
  const status: Status = todayCheckedIn ? "ok" : (lastTime && isTimeout ? "timeout" : "none")
  const colors = getColors(status)

  // 背景光晕动画
  const bgGlowOpacity = useObservable(0)

  useEffect(() => {
    setTimeout(() => {
      bgGlowOpacity.setValue(0.4)
    }, 100)
  }, [])

  const bgGlowAnimation = useMemo(() => ({
    opacity: bgGlowOpacity.value,
    animation: { animation: Animation.easeOut(2), value: bgGlowOpacity.value },
  }), [bgGlowOpacity.value])

  return (
    <ZStack frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
      {/* 主内容层 */}
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background="systemGroupedBackground">
        {/* 顶部导航栏 */}
        <HStack padding={16} frame={{ maxWidth: Infinity }}>
          <Button action={dismiss}>
            <Image systemName="xmark.circle.fill" foregroundStyle="secondaryLabel" font={24} />
          </Button>
          <Spacer />
          <Button action={() => Navigation.present(<SettingsPage />)}>
            <Image systemName="gearshape.fill" foregroundStyle="secondaryLabel" font={24} />
          </Button>
        </HStack>

        <Spacer frame={{ height: 100 }} />
        <Spacer />

        {/* 中心打卡区域 */}
        <VStack spacing={32}>
          <Text font="subheadline" foregroundStyle="secondaryLabel">{formatDate(true)}</Text>
          <Text font="largeTitle" fontWeight="bold" foregroundStyle="label">
            {todayCheckedIn ? "活着呢" : "活着吗"}
          </Text>

          <ZStack>
            {/* 背景光晕 */}
            <Circle fill={colors.light} frame={{ width: 250, height: 250 }} {...bgGlowAnimation} />
            <Circle fill={colors.light} frame={{ width: 140, height: 140 }} {...pulseAnimation1} />
            <Circle fill={colors.light} frame={{ width: 140, height: 140 }} {...pulseAnimation2} />
            <Button action={handleClockin}>
              <ZStack frame={{ width: 140, height: 140 }}>
                <Circle fill={colors.main} shadow={{ color: colors.main, radius: 20, y: 4 }} scaleEffect={isPressed ? 0.95 : 1} />
                {todayCheckedIn ? (
                  <VStack spacing={4}>
                    <Image systemName="party.popper.fill" foregroundStyle="white" font={40} />
                    <Text font="title2" fontWeight="bold" foregroundStyle="white">活着</Text>
                  </VStack>
                ) : (
                  <VStack spacing={8}>
                    <Image systemName="ghost.fill" foregroundStyle="white" font={40} />
                    <VStack spacing={2}>
                      <Text font="headline" fontWeight="bold" foregroundStyle="white">今日签到</Text>
                      <Text font="caption2" foregroundStyle="white" opacity={0.8}>尚未开始</Text>
                    </VStack>
                  </VStack>
                )}
              </ZStack>
            </Button>
            {showPlusOne && (
              <Text font="title" fontWeight="bold" foregroundStyle={colors.main} {...plusOneAnimation}>+1天</Text>
            )}
          </ZStack>

          {/* 状态信息 */}
          <VStack spacing={8}>
            {lastTime ? (
              <VStack spacing={8}>
                <Text font="subheadline" foregroundStyle="secondaryLabel">上次打卡：{formatRelativeTime(lastTime)}</Text>
                <Text font="caption" foregroundStyle="tertiaryLabel">{formatTime(lastTime)}</Text>
                {!todayCheckedIn && isTimeout && (
                  <HStack spacing={4}>
                    <Image systemName="exclamationmark.triangle.fill" foregroundStyle="systemOrange" font={12} />
                    <Text font="caption" foregroundStyle="systemOrange">已超时，请尽快打卡</Text>
                  </HStack>
                )}
                {!todayCheckedIn && !isTimeout && (
                  <Text font="caption" foregroundStyle="tertiaryLabel">
                    距离触发通知还有 {Math.max(0, Math.ceil((CONFIG.ALERT_AFTER_DAYS * 24) - (Date.now() - lastTime) / 3600000))} 小时
                  </Text>
                )}
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Text font="subheadline" foregroundStyle="secondaryLabel">还没有打卡记录</Text>
                <Text font="caption" foregroundStyle="tertiaryLabel">
                  超过 {CONFIG.ALERT_AFTER_DAYS * 24} 小时未打卡将触发通知
                </Text>
              </VStack>
            )}
            {todaySteps !== null && (
              <HStack spacing={4}>
                <Image systemName="figure.walk" foregroundStyle={colors.main} font={14} />
                <Text font="subheadline" foregroundStyle="secondaryLabel">今日步数：</Text>
                <Text font="subheadline" fontWeight="semibold" foregroundStyle={colors.main}>{todaySteps}</Text>
              </HStack>
            )}
          </VStack>
        </VStack>

        <Spacer />

        {/* 底部提示 */}
        <VStack spacing={12} padding={32}>
          <Button action={() => Navigation.present(<UsagePage />)}>
            <HStack padding={12} frame={{ maxWidth: Infinity }} background="rgba(16, 185, 129, 0.15)" clipShape="rect">
              <Image systemName="questionmark.circle.fill" foregroundStyle="rgba(16, 185, 129, 1)" font={18} />
              <Text font="headline" foregroundStyle="rgba(16, 185, 129, 1)" fontWeight="semibold">使用方法</Text>
            </HStack>
          </Button>
          <HStack padding={12} frame={{ maxWidth: Infinity }} background="rgba(239, 68, 68, 0.1)" clipShape="rect">
            <Image systemName="exclamationmark.triangle.fill" foregroundStyle="systemRed" font={14} />
            <Text font="caption" foregroundStyle="systemRed" fontWeight="medium">
              1日未签到，系统将以您的名义，在次日通知您的紧急联系人。
            </Text>
          </HStack>
          <HStack spacing={4}>
            <Button action={() => Navigation.present(<InfoPage title="签到说明" sections={aboutSections} />)}>
              <Text font="caption" foregroundStyle="systemBlue">签到即同意</Text>
            </Button>
            <Button action={() => Navigation.present(<InfoPage title="隐私政策" sections={privacySections} />)}>
              <Text font="caption" foregroundStyle="systemBlue">隐私政策</Text>
            </Button>
            <Button action={() => Navigation.present(<InfoPage title="用户协议" sections={agreementSections} />)}>
              <Text font="caption" foregroundStyle="systemBlue">用户协议</Text>
            </Button>
          </HStack>
        </VStack>
      </VStack>

      {/* 弹幕层 */}
      <DanmakuLayer color={colors.main} screenWidth={Device.screen.width} />
    </ZStack>
  )
}

// ==================== 入口 ====================
const { action, silent } = Script.queryParameters ?? {}
const isSilent = silent === "true"

async function runAction() {
  switch (action) {
    case "check":
      await checkAndNotify()
      break
    case "auto":
      autoClockIn()
      break
    case "clockin":
      handleWidgetClockin(action)
      break
    default:
      await checkAndNotify()
  }
}

runAction()

if (!isSilent) Navigation.present(<MainPage />)
