import {
  VStack, ZStack, Text, Button, Image, Circle, Color,
  useState, useMemo, useObservable
} from "scripting"

interface ClockinButtonProps {
  todayCheckedIn: boolean
  colors: { main: Color; light: Color }
  onClockin: () => Promise<void>
}

export function ClockinButton({ todayCheckedIn, colors, onClockin }: ClockinButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [showPlusOne, setShowPlusOne] = useState(false)

  // 脉冲动画
  const pulseScale1 = useObservable(1)
  const pulseOpacity1 = useObservable(0.6)
  const pulseScale2 = useObservable(1)
  const pulseOpacity2 = useObservable(0.4)

  // +1天动画
  const plusOneOpacity = useObservable(0)
  const plusOneOffsetY = useObservable(0)

  // 启动脉冲动画
  useState(() => {
    pulseScale1.setValue(1.5)
    pulseOpacity1.setValue(0)
    setTimeout(() => {
      pulseScale2.setValue(1.5)
      pulseOpacity2.setValue(0)
    }, 500)
  })

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

  async function handlePress() {
    if (todayCheckedIn) return

    setIsPressed(true)
    await onClockin()
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

  return (
    <ZStack>
      <Circle fill={colors.light} frame={{ width: 140, height: 140 }} {...pulseAnimation1} />
      <Circle fill={colors.light} frame={{ width: 140, height: 140 }} {...pulseAnimation2} />
      <Button action={handlePress}>
        <ZStack frame={{ width: 140, height: 140 }}>
          <Circle
            fill={colors.main}
            shadow={{ color: colors.main, radius: 20, y: 4 }}
            scaleEffect={isPressed ? 0.95 : 1}
          />
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
        <Text font="title" fontWeight="bold" foregroundStyle={colors.main} {...plusOneAnimation}>
          +1天
        </Text>
      )}
    </ZStack>
  )
}
