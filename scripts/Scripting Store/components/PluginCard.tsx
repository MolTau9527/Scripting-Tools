import { HStack, VStack } from 'scripting'
import { useColors } from '../contexts/ThemeContext'
import { FavoriteButton } from './common/FavoriteButton'
import { GetButton } from './common/GetButton'
import { PluginSummary } from './common/PluginSummary'
import { PressableRow } from './common/PressableRow'
import { spacing, fontSize, cornerRadius } from '../utils/styles'
import type { Plugin } from '../types'
import { formatAuthorNames } from '../utils/author'

// ============================================================
// Types
// ============================================================

export interface PluginCardProps {
  plugin: Plugin
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  isInstalling?: boolean
  installDisabled?: boolean
}

// ============================================================
// Component - App Store 应用卡片样式
// ============================================================

export const PluginCard = ({
  plugin,
  onInstall,
  onDetail,
  isInstalling = false,
  installDisabled = false,
}: PluginCardProps) => {
  const colors = useColors()
  const metaText = `${formatAuthorNames(plugin.author)} · 更新于 ${plugin.updateTime || '未知'}`

  return (
    <VStack
      padding={spacing.md}
      background={colors.secondaryBackground}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.lg }}
      frame={{ maxWidth: 'infinity' }}
    >
      <HStack alignment="center" spacing={spacing.sm} frame={{ maxWidth: 'infinity' }}>
        <PressableRow onPress={() => onDetail(plugin)}>
          <PluginSummary
            plugin={plugin}
            title={plugin.name}
            subtitle={metaText}
            titleFont={fontSize.subheadline}
            subtitleFont={fontSize.caption1}
            titleWeight="medium"
            spacing={spacing.sm}
          />
        </PressableRow>

        <HStack spacing={spacing.xs} alignment="center">
          <FavoriteButton pluginId={plugin.id} />
          <GetButton
            onPress={() => onInstall(plugin)}
            isLoading={isInstalling}
            disabled={installDisabled}
          />
        </HStack>
      </HStack>
    </VStack>
  )
}
