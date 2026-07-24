import { Image, Text, VStack } from 'scripting'
import type { SemanticColors } from '../../contexts/ThemeContext'
import { cornerRadius } from '../../utils/styles'
import { isImageUrl } from '../../utils/urlValidator'
import type { Plugin } from '../../types'

// ============================================================
// Types
// ============================================================

export interface PluginIconProps {
  plugin: Plugin
  colors: SemanticColors
  size?: 'small' | 'medium'
}

// ============================================================
// Size Configuration
// ============================================================

const sizeConfig = {
  small: { dimension: 44, radius: cornerRadius.md, fontSize: 24 },
  medium: { dimension: 60, radius: cornerRadius.lg, fontSize: 32 },
} as const

// ============================================================
// Component
// ============================================================

export const PluginIcon = ({ plugin, colors, size = 'medium' }: PluginIconProps) => {
  const config = sizeConfig[size]

  // SF Symbol 图标
  if (plugin.symbol) {
    return (
      <VStack
        frame={{ width: config.dimension, height: config.dimension }}
        background={colors.tertiaryFill}
        clipShape={{ type: 'rect', cornerRadius: config.radius }}
      >
        <Image
          systemName={plugin.symbol}
          font={config.fontSize}
          foregroundStyle={colors.label}
        />
      </VStack>
    )
  }

  // URL 图标
  if (plugin.icon && isImageUrl(plugin.icon)) {
    return (
      <Image
        imageUrl={plugin.icon}
        resizable
        frame={{ width: config.dimension, height: config.dimension }}
        clipShape={{ type: 'rect', cornerRadius: config.radius }}
        placeholder={
          <VStack
            frame={{ width: config.dimension, height: config.dimension }}
            background={colors.tertiaryFill}
            clipShape={{ type: 'rect', cornerRadius: config.radius }}
          >
            <Text font={config.fontSize}>📦</Text>
          </VStack>
        }
      />
    )
  }

  // Emoji 或默认图标
  return (
    <VStack
      frame={{ width: config.dimension, height: config.dimension }}
      background={colors.tertiaryFill}
      clipShape={{ type: 'rect', cornerRadius: config.radius }}
      alignment="center"
    >
      <Text font={config.fontSize}>{plugin.icon || '📦'}</Text>
    </VStack>
  )
}
