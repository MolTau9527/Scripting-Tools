import { Text, VStack, HStack } from 'scripting'
import { useColors, type SemanticColors } from '../../contexts/ThemeContext'
import type { Plugin } from '../../types'
import { fontSize, spacing } from '../../utils/styles'
import { PluginIcon, type PluginIconProps } from './PluginIcon'

type SummaryColorKey = keyof Pick<SemanticColors, 'label' | 'secondaryLabel' | 'tertiaryLabel'>
type SummaryFontWeight = 'medium' | 'semibold' | 'bold'

export interface PluginSummaryProps {
  plugin: Plugin
  title: string
  subtitle?: string
  caption?: string
  showIcon?: boolean
  iconSize?: PluginIconProps['size']
  titleFont?: number
  subtitleFont?: number
  captionFont?: number
  titleWeight?: SummaryFontWeight
  titleColor?: SummaryColorKey
  subtitleColor?: SummaryColorKey
  captionColor?: SummaryColorKey
  titleLineLimit?: number
  subtitleLineLimit?: number
  captionLineLimit?: number
  spacing?: number
  textSpacing?: number
}

export const PluginSummary = ({
  plugin,
  title,
  subtitle,
  caption,
  showIcon = true,
  iconSize = 'small',
  titleFont = fontSize.subheadline,
  subtitleFont = fontSize.caption1,
  captionFont = fontSize.caption1,
  titleWeight = 'medium',
  titleColor = 'label',
  subtitleColor = 'secondaryLabel',
  captionColor = 'tertiaryLabel',
  titleLineLimit = 1,
  subtitleLineLimit = 1,
  captionLineLimit = 1,
  spacing: rowSpacing = spacing.md,
  textSpacing = 2,
}: PluginSummaryProps) => {
  const colors = useColors()

  return (
    <HStack
      spacing={rowSpacing}
      alignment="center"
      frame={{ maxWidth: 'infinity', alignment: 'leading' }}
    >
      {showIcon ? <PluginIcon plugin={plugin} size={iconSize} /> : null}

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

        {caption ? (
          <Text
            font={captionFont}
            foregroundStyle={colors[captionColor]}
            lineLimit={captionLineLimit}
            frame={{ maxWidth: 'infinity', alignment: 'leading' }}
          >
            {caption}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  )
}
