import { VStack, ZStack } from 'scripting'
import { cornerRadius, darkGlassTint } from '../../utils/styles'
import { useActualMode, useColors } from '../../contexts/ThemeContext'

const LIGHT_SURFACE_GLASS = UIGlass.regular()
const DARK_SURFACE_GLASS = UIGlass.regular().tint(darkGlassTint)

/**
 * 主题行背景 - 分层玻璃效果设计
 *
 * 玻璃类型选择策略：
 * - surface: regular() - 标准毛玻璃，适合普通内容区域
 * - elevated: 加深主题水洗色，适合悬浮卡片和强调区域
 *
 * 系统玻璃材质本身偏灰，因此在玻璃下垫一层星空蓝水洗色，
 * 让行背景读作"蓝玻璃"而非"灰玻璃"。
 */
interface ThemeRowBackgroundProps {
  variant?: 'surface' | 'elevated'
}

export const ThemeRowBackground = ({ variant = 'surface' }: ThemeRowBackgroundProps) => {
  const actualMode = useActualMode()
  const colors = useColors()
  const surfaceGlass = actualMode === 'dark' ? DARK_SURFACE_GLASS : LIGHT_SURFACE_GLASS

  // 行背景不是按钮，一律用 regular 材质（交互态清玻璃逐行物化成本高，
  // 快速滚动时行渲染跟不上）；elevated 的层级感由更浓的水洗色表达。
  const shape = { type: 'rect', cornerRadius: cornerRadius.lg, style: 'continuous' } as const

  // 水洗色跟随主题（星空蓝/樱花粉/木质调各自的色相）
  const tintWash = colors.glassWash

  return (
    <ZStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}>
      <VStack
        frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
        background={tintWash}
        clipShape={shape}
      />
      {variant === 'elevated' ? (
        <VStack
          frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
          background={tintWash}
          clipShape={shape}
        />
      ) : null}
      <VStack
        frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
        glassEffect={{ glass: surfaceGlass, shape }}
      />
    </ZStack>
  )
}
