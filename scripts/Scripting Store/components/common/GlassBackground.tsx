import { Canvas, Rectangle, ZStack, useCallback, useMemo } from 'scripting'
import type { CanvasRenderingContext, CanvasSize, Color, ShapeStyle } from 'scripting'
import { useActualMode, useLightTheme } from '../../contexts/ThemeContext'
import type { LightTheme } from '../../contexts/ThemeContext'

const SCREEN_WIDTH = Device.screen.width
const SCREEN_HEIGHT = Device.screen.height
const SCREEN_FRAME = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } as const
const SCREEN_GLOW_RADIUS = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT)

// 星点坐标表：[x 比例, y 比例, 直径, 不透明度]。
// 全部为确定性字面量，避免每次渲染闪烁；上半屏更密，模拟自然星空。
const STAR_FIELD: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.06, 0.04, 1.6, 0.85], [0.14, 0.11, 1.2, 0.55], [0.22, 0.05, 2.0, 0.90],
  [0.31, 0.14, 1.4, 0.60], [0.38, 0.03, 1.2, 0.50], [0.45, 0.09, 1.8, 0.80],
  [0.53, 0.15, 1.2, 0.45], [0.60, 0.05, 1.6, 0.75], [0.68, 0.12, 1.3, 0.55],
  [0.76, 0.04, 2.2, 0.90], [0.84, 0.10, 1.4, 0.60], [0.92, 0.06, 1.7, 0.80],
  [0.10, 0.19, 1.3, 0.50], [0.27, 0.22, 1.7, 0.70], [0.49, 0.24, 1.2, 0.45],
  [0.66, 0.20, 1.9, 0.80], [0.81, 0.25, 1.3, 0.50], [0.95, 0.18, 1.5, 0.65],
  [0.05, 0.31, 1.6, 0.65], [0.19, 0.35, 1.2, 0.40], [0.36, 0.30, 1.5, 0.60],
  [0.57, 0.33, 1.2, 0.45], [0.73, 0.37, 1.7, 0.70], [0.89, 0.32, 1.2, 0.45],
  [0.12, 0.44, 1.4, 0.50], [0.30, 0.47, 1.2, 0.35], [0.52, 0.45, 1.6, 0.60],
  [0.70, 0.49, 1.2, 0.40], [0.87, 0.44, 1.4, 0.55], [0.08, 0.57, 1.2, 0.35],
  [0.25, 0.60, 1.5, 0.50], [0.47, 0.58, 1.2, 0.30], [0.64, 0.62, 1.3, 0.40],
  [0.82, 0.59, 1.2, 0.35], [0.16, 0.72, 1.3, 0.35], [0.41, 0.74, 1.2, 0.30],
  [0.59, 0.70, 1.4, 0.40], [0.78, 0.75, 1.2, 0.30], [0.33, 0.85, 1.2, 0.25],
  [0.55, 0.88, 1.3, 0.30], [0.71, 0.84, 1.2, 0.25], [0.90, 0.80, 1.4, 0.35],
]

// 亮星：带光晕的重点星，仅少数几颗。
const BRIGHT_STARS: ReadonlyArray<readonly [number, number]> = [
  [0.18, 0.08], [0.63, 0.16], [0.86, 0.28], [0.40, 0.38],
]

interface SkyPalette {
  gradient: [Color, Color, Color]
  nebula: Color
  horizonGlow: Color
  starColor: string
  starOpacityScale: number
}

// 深色：深空蓝 → 午夜蓝 → 靛蓝地平线（高饱和，确保读作蓝而非灰黑）
const darkSky: SkyPalette = {
  gradient: ['#050E2A', '#0B2350', '#1B4A8F'],
  nebula: 'rgba(96,165,250,0.30)',
  horizonGlow: 'rgba(129,140,248,0.18)',
  starColor: '#FFFFFF',
  starOpacityScale: 1,
}

// 浅色·星空蓝：晨空蓝，星点淡化为若隐若现的蓝色微光
const starryLightSky: SkyPalette = {
  gradient: ['#DCEAFE', '#C3D9FB', '#A8C6F4'],
  nebula: 'rgba(255,255,255,0.55)',
  horizonGlow: 'rgba(96,165,250,0.35)',
  starColor: '#4F76B4',
  starOpacityScale: 0.4,
}

// 浅色·樱花粉：晨樱粉渐变，星点化作飘散的粉色花瓣微光
const sakuraLightSky: SkyPalette = {
  gradient: ['#FDEDF3', '#F9D6E5', '#F2BBD3'],
  nebula: 'rgba(255,255,255,0.55)',
  horizonGlow: 'rgba(236,112,166,0.30)',
  starColor: '#C25E86',
  starOpacityScale: 0.4,
}

// 浅色·木质调：暖纸浆到浅胡桃的木纹渐变，星点为咖啡色微粒
const woodLightSky: SkyPalette = {
  gradient: ['#F8F0E2', '#EFDFC5', '#E0C79F'],
  nebula: 'rgba(255,255,255,0.50)',
  horizonGlow: 'rgba(176,120,56,0.28)',
  starColor: '#8A6B43',
  starOpacityScale: 0.4,
}

const lightSkies: Record<LightTheme, SkyPalette> = {
  starry: starryLightSky,
  sakura: sakuraLightSky,
  wood: woodLightSky,
}

interface StarCanvasProps {
  sky: SkyPalette
}

// 所有星点合并进一个 SwiftUI Canvas：保持原坐标和视觉层次，
// 同时把 50 个独立 Circle 视图压缩为一个静态原生绘制层。
const StarCanvas = ({ sky }: StarCanvasProps) => {
  const drawStars = useCallback((context: CanvasRenderingContext, size: CanvasSize) => {
      context.fillStyle = sky.starColor

      for (const [xFactor, yFactor, diameter, opacity] of STAR_FIELD) {
        context.globalAlpha = opacity * sky.starOpacityScale
        context.beginPath()
        context.arc(
          xFactor * size.width,
          yFactor * size.height,
          diameter / 2,
          0,
          Math.PI * 2,
        )
        context.fill()
      }

      for (const [xFactor, yFactor] of BRIGHT_STARS) {
        context.globalAlpha = 0.22 * sky.starOpacityScale
        context.beginPath()
        context.arc(xFactor * size.width, yFactor * size.height, 3.5, 0, Math.PI * 2)
        context.fill()

        context.globalAlpha = 0.95 * sky.starOpacityScale
        context.beginPath()
        context.arc(xFactor * size.width, yFactor * size.height, 1.1, 0, Math.PI * 2)
        context.fill()
      }

      context.globalAlpha = 1
  }, [sky])

  return (
    <Canvas
      opaque={false}
      draw={drawStars}
      frame={SCREEN_FRAME}
      allowsHitTesting={false}
    />
  )
}

/**
 * 星空蓝背景层 - 纯 Scripting 原生形状实现，不依赖图片资源
 *
 * 层次结构：
 * 1. 底层线性渐变 - 天顶到地平线的星空蓝过渡
 * 2. 星云径向光晕 - 右上柔光，增加空间纵深
 * 3. 地平线光晕 - 左下淡光，模拟大气辉光
 * 4. 星点层 - 确定性坐标的原生 Circle 星野
 * 5. 亮星层 - 少量带模糊光晕的重点星
 */
export const GlassBackground = () => {
  const actualMode = useActualMode()
  const lightTheme = useLightTheme()
  const sky = actualMode === 'dark' ? darkSky : lightSkies[lightTheme]
  const fills = useMemo<{ sky: ShapeStyle, nebula: ShapeStyle, horizon: ShapeStyle }>(() => ({
    sky: {
      colors: sky.gradient,
      startPoint: 'top' as const,
      endPoint: 'bottom' as const,
    },
    nebula: {
      colors: [sky.nebula, 'rgba(0,0,0,0.0)'],
      center: 'topTrailing' as const,
      startRadius: 0,
      endRadius: SCREEN_GLOW_RADIUS * 0.85,
    },
    horizon: {
      colors: [sky.horizonGlow, 'rgba(0,0,0,0.0)'],
      center: 'bottomLeading' as const,
      startRadius: 0,
      endRadius: SCREEN_GLOW_RADIUS * 0.7,
    },
  }), [sky])

  // 星野按设备屏幕固定尺寸一次成型，不用 GeometryReader：
  // 底部工具栏收展（搜索 minimize）、键盘弹收等任何安全区变化
  // 都不会再触发背景重排——这是搜索收展瞬间闪白的根源。
  return (
    <ZStack
      frame={SCREEN_FRAME}
      clipped
      ignoresSafeArea={{ regions: 'container', edges: 'all' }}
      allowsHitTesting={false}
    >
            {/* Layer 1: 底层线性渐变 - 天顶暗、地平线亮 */}
            <Rectangle
              fill={fills.sky}
              frame={SCREEN_FRAME}
              allowsHitTesting={false}
            />

            {/* Layer 2: 星云径向光晕 - 右上 */}
            <Rectangle
              fill={fills.nebula}
              frame={SCREEN_FRAME}
              allowsHitTesting={false}
            />

            {/* Layer 3: 地平线光晕 - 左下 */}
            <Rectangle
              fill={fills.horizon}
              frame={SCREEN_FRAME}
              allowsHitTesting={false}
            />

            {/* Layer 4: 星点、亮星光晕与星核统一由一个静态原生 Canvas 绘制。 */}
            <StarCanvas sky={sky} />
    </ZStack>
  )
}
