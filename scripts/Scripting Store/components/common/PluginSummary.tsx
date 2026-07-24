import { Text, VStack, HStack } from 'scripting'
import type { SemanticColors } from '../../contexts/ThemeContext'
import type { Plugin } from '../../types'
import { fontSize, spacing } from '../../utils/styles'
import { PluginIcon, type PluginIconProps } from './PluginIcon'

type SummaryColorKey = keyof Pick<SemanticColors, 'label' | 'secondaryLabel' | 'tertiaryLabel'>
type SummaryFontWeight = 'medium' | 'semibold' | 'bold'

interface PluginSummaryProps {
  plugin: Plugin
  colors: SemanticColors
  title: string
  subtitle?: string
  showIcon?: boolean
  iconSize?: PluginIconProps['size']
  titleFont?: number
  subtitleFont?: number
  titleWeight?: SummaryFontWeight
  titleColor?: SummaryColorKey
  subtitleColor?: SummaryColorKey
  titleLineLimit?: number
  subtitleLineLimit?: number
  spacing?: number
  textSpacing?: number
}

export const PluginSummary = ({
  plugin,
  colors,
  title,
  subtitle,
  showIcon = true,
  iconSize = 'small',
  titleFont = fontSize.subheadline,
  subtitleFont = fontSize.caption1,
  titleWeight = 'medium',
  titleColor = 'label',
  subtitleColor = 'secondaryLabel',
  titleLineLimit = 1,
  subtitleLineLimit = 1,
  spacing: rowSpacing = spacing.md,
  textSpacing = 2,
}: PluginSummaryProps) => {
  return (
    <HStack
      spacing={rowSpacing}
      alignment="center"
      frame={{ maxWidth: 'infinity', alignment: 'leading' }}
    >
      {showIcon ? <PluginIcon plugin={plugin} colors={colors} size={iconSize} /> : null}

      <VStack
        alignment="leading"
        spacing={textSpacing}
        frame={{ maxWidth: 'infinity', alignment: 'leading' }}
      >
        <Text
          font={titleFont}
          fontWeight={titleWeight}
          foregroundStyle={colors[titleColor]}
          lineLimit={titleLineLimit}
          frame={{ maxWidth: 'infinity', alignment: 'leading' }}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            font={subtitleFont}
            foregroundStyle={colors[subtitleColor]}
            lineLimit={subtitleLineLimit}
            frame={{ maxWidth: 'infinity', alignment: 'leading' }}
          >
            {subtitle}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  )
}
