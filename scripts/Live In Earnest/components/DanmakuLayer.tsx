import { VStack, ZStack, Spacer, useState, useEffect, useRef, Color } from "scripting"
import { DanmakuText } from "./DanmakuText"
import { MOTIVATIONAL_PHRASES } from "../constants/phrases"

interface DanmakuItem {
  id: number
  text: string
  row: number
  startTime: number
}

interface DanmakuLayerProps {
  color: Color
  screenWidth: number
}

export function DanmakuLayer({ color, screenWidth }: DanmakuLayerProps) {
  const [danmakuItems, setDanmakuItems] = useState<DanmakuItem[]>([])
  const nextIdRef = useRef(0)
  const nextPhraseIndexRef = useRef(Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length))

  useEffect(() => {
    const totalRows = 3
    const animationDuration = 10000 // 动画持续时间（稍长一点更流畅）
    const spawnInterval = 2000 // 生成间隔（稍短一点让弹幕更密集）
    const cleanupInterval = 3000 // 清理间隔
    let rowCounter = 0
    let isActive = true

    const addDanmaku = () => {
      if (!isActive) return

      const id = nextIdRef.current++
      const text = MOTIVATIONAL_PHRASES[nextPhraseIndexRef.current]
      nextPhraseIndexRef.current = (nextPhraseIndexRef.current + 1) % MOTIVATIONAL_PHRASES.length
      const row = rowCounter
      rowCounter = (rowCounter + 1) % totalRows

      setDanmakuItems(prev => [...prev, { id, text, row, startTime: Date.now() }])
    }

    // 定期清理已完成动画的弹幕
    const cleanup = () => {
      if (!isActive) return
      const now = Date.now()
      setDanmakuItems(prev => prev.filter(item => now - item.startTime < animationDuration + 500))
    }

    // 初始添加几条弹幕，错开时间
    addDanmaku()
    const initTimer1 = setTimeout(() => addDanmaku(), 800)
    const initTimer2 = setTimeout(() => addDanmaku(), 1600)

    // 循环添加弹幕
    let spawnTimerId: number | null = null
    const spawnLoop = () => {
      if (!isActive) return
      addDanmaku()
      spawnTimerId = setTimeout(spawnLoop, spawnInterval)
    }
    const startSpawnTimer = setTimeout(() => spawnLoop(), spawnInterval)

    // 循环清理
    let cleanupTimerId: number | null = null
    const cleanupLoop = () => {
      if (!isActive) return
      cleanup()
      cleanupTimerId = setTimeout(cleanupLoop, cleanupInterval)
    }
    const startCleanupTimer = setTimeout(() => cleanupLoop(), cleanupInterval)

    return () => {
      isActive = false
      clearTimeout(initTimer1)
      clearTimeout(initTimer2)
      clearTimeout(startSpawnTimer)
      clearTimeout(startCleanupTimer)
      if (spawnTimerId !== null) clearTimeout(spawnTimerId)
      if (cleanupTimerId !== null) clearTimeout(cleanupTimerId)
    }
  }, [])

  return (
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} allowsHitTesting={false}>
      <Spacer frame={{ height: 56 }} />
      <ZStack frame={{ maxWidth: Infinity, height: 100 }} alignment="topLeading">
        {danmakuItems.map(item => (
          <DanmakuText
            key={item.id}
            text={item.text}
            startX={screenWidth}
            endX={-screenWidth}
            color={color}
            row={item.row}
          />
        ))}
      </ZStack>
      <Spacer />
    </VStack>
  )
}
