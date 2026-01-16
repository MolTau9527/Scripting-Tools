import { Text, useMemo, useObservable, useEffect, Color } from "scripting"

interface DanmakuTextProps {
  text: string
  startX: number
  endX: number
  color: Color
  row: number
}

export function DanmakuText({ text, startX, endX, color, row }: DanmakuTextProps) {
  // 从 startX 开始，动画到 endX
  const offsetX = useObservable(startX)

  // 组件挂载后立即开始动画
  useEffect(() => {
    // 使用 requestAnimationFrame 风格的延迟，确保初始位置已渲染
    const timerId = setTimeout(() => {
      offsetX.setValue(endX)
    }, 50)
    return () => clearTimeout(timerId)
  }, [])

  const animationProps = useMemo(() => ({
    offset: { x: offsetX.value, y: row * 30 },
    animation: { animation: Animation.linear(10), value: offsetX.value },
  }), [offsetX.value, row])

  return (
    <Text
      font="title3"
      fontWeight="bold"
      foregroundStyle={color}
      opacity={0.85}
      {...animationProps}
    >
      {text}
    </Text>
  )
}
