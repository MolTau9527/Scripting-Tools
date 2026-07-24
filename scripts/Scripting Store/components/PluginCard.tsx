import { HStack, Rectangle } from 'scripting'
import { FavoriteButton } from './common/FavoriteButton'
import { GetButton } from './common/GetButton'
import { PluginSummary } from './common/PluginSummary'
import { PressableRow } from './common/PressableRow'
import type { SemanticColors } from '../contexts/ThemeContext'
import { spacing, fontSize, darkGlassTint } from '../utils/styles'
import type { Plugin } from '../types'
import { formatAuthorNames } from '../utils/author'

const LIGHT_CARD_GLASS = UIGlass.regular()
const DARK_CARD_GLASS = UIGlass.regular().tint(darkGlassTint)

// ============================================================
// Types
// ============================================================

interface PluginCardProps {
  plugin: Plugin
  actualMode: 'light' | 'dark'
  colors: SemanticColors
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  isInstalling?: boolean
  installDisabled?: boolean
}

// ============================================================
// Component - 液态玻璃卡片设计
// ============================================================

export const PluginCard = ({
  plugin,
  actualMode,
  colors,
  onInstall,
  onDetail,
  isInstalling = false,
  installDisabled = false,
}: PluginCardProps) => {
  const metaText = `${formatAuthorNames(plugin.author)} · 更新于 ${plugin.updateTime || '未知'}`
  // 列表行用 regular 玻璃 + 小阴影：交互态清玻璃与大半径阴影会显著拖慢
  // 快速滚动时的行实例化，导致新行渲染不及时
  const cardGlass = actualMode === 'dark' ? DARK_CARD_GLASS : LIGHT_CARD_GLASS

  return (
    <HStack
      padding={{ top: spacing.md, bottom: spacing.md, leading: spacing.lg, trailing: spacing.lg }}
      alignment="center"
      spacing={spacing.md}
      frame={{ maxWidth: 'infinity' }}
      glassEffect={{
        glass: cardGlass,
        shape: { type: 'rect', cornerRadius: 24, style: 'continuous' },
      }}
      shadow={{ color: 'rgba(20,35,70,0.12)', radius: 8, y: 3 }}
      listRowBackground={<Rectangle fill="rgba(0,0,0,0)" />}
      listRowSeparator="hidden"
      listRowInsets={{ top: spacing.xs, bottom: spacing.xs, leading: 0, trailing: 0 }}
    >
      <PressableRow onPress={() => onDetail(plugin)}>
        <PluginSummary
          plugin={plugin}
          colors={colors}
          title={plugin.name}
          subtitle={metaText}
          iconSize="medium"
          titleFont={fontSize.body}
          subtitleFont={fontSize.caption1}
          titleWeight="semibold"
          spacing={spacing.md}
        />
      </PressableRow>

      <HStack spacing={spacing.sm} alignment="center">
        <FavoriteButton pluginId={plugin.id} />
        <GetButton
          tint={colors.tint}
          onPress={() => onInstall(plugin)}
          isLoading={isInstalling}
          disabled={installDisabled}
        />
      </HStack>
    </HStack>
  )
}
