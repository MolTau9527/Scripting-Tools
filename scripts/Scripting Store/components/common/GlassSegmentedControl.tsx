import { GlassEffectContainer, HStack, Image, Text } from 'scripting'
import { useActualMode, useColors } from '../../contexts/ThemeContext'
import { createSymmetricPadding, darkGlassTint, fontSize, spacing } from '../../utils/styles'

/**
 * 原生液态玻璃分段切换器
 *
 * 基于 iOS 26 GlassEffectContainer：多个玻璃胶囊在容器内液态融合，
 * 形成一体的原生玻璃切换器，而不是拼接的实色胶囊。
 * - 选中项：tint 染色交互玻璃（随主题强调色变化）
 * - 未选中项：regular 玻璃（深色模式下染深空蓝，避免发白）
 */
interface GlassSegmentOption<T extends string> {
  value: T
  label: string
  icon: string
}

interface GlassSegmentedControlProps<T extends string> {
  options: ReadonlyArray<GlassSegmentOption<T>>
  value: T
  onChange: (value: T) => void
}

export function GlassSegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: GlassSegmentedControlProps<T>) {
  const actualMode = useActualMode()
  const colors = useColors()
  const isDark = actualMode === 'dark'

  const baseGlass = isDark ? UIGlass.regular().tint(darkGlassTint) : UIGlass.regular()

  return (
    <GlassEffectContainer spacing={spacing.sm}>
      <HStack spacing={spacing.sm} frame={{ maxWidth: 'infinity' }}>
        {options.map((option) => {
          const selected = option.value === value
          const glass = selected
            ? UIGlass.clear().tint(colors.tint).interactive(true)
            : baseGlass
          const foreground = selected ? '#ffffff' : colors.secondaryLabel

          return (
            <HStack
              key={option.value}
              padding={createSymmetricPadding(10, spacing.md)}
              frame={{ maxWidth: 'infinity', alignment: 'center' }}
              alignment="center"
              spacing={spacing.xs}
              glassEffect={{ glass, shape: 'capsule' }}
              contentShape="capsule"
              onTapGesture={() => onChange(option.value)}
              accessibilityAddTraits="isButton"
              accessibilityLabel={option.label}
              accessibilityValue={selected ? '已选中' : '未选中'}
            >
              <Image systemName={option.icon} foregroundStyle={foreground} frame={{ width: 16, height: 16 }} />
              <Text font={fontSize.footnote} fontWeight="semibold" foregroundStyle={foreground}>
                {option.label}
              </Text>
            </HStack>
          )
        })}
      </HStack>
    </GlassEffectContainer>
  )
}
