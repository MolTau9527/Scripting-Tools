import { DragGesture, HStack, Rectangle, ScrollView, ScrollViewReader, VStack } from 'scripting'
import type { ScrollViewProxy } from 'scripting'
import { FavoriteButton } from './common/FavoriteButton'
import { GetButton } from './common/GetButton'
import { PluginSummary } from './common/PluginSummary'
import { PressableRow } from './common/PressableRow'
import type { SemanticColors } from '../contexts/ThemeContext'
import { useFeaturedCarousel } from '../hooks/useFeaturedCarousel'
import { spacing, fontSize, darkGlassTint } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import type { Plugin } from '../types'
import { formatAuthorNames } from '../utils/author'

interface FeaturedSectionProps {
  plugins: Plugin[]
  actualMode: 'light' | 'dark'
  colors: SemanticColors
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  installingPluginKey?: string | null
  isPaused?: boolean
}

const CARD_WIDTH = 280
const CARD_GAP = spacing.xl
const CARD_STRIDE = CARD_WIDTH + CARD_GAP
const TRACK_HEIGHT = 168
const MARQUEE_SPEED = 28
const LIGHT_FEATURED_GLASS = UIGlass.clear()
const DARK_FEATURED_GLASS = UIGlass.clear().tint(darkGlassTint)

interface FeaturedTrackProps extends FeaturedSectionProps {
  proxy: ScrollViewProxy
}

interface FeaturedCardProps {
  plugin: Plugin
  actualMode: 'light' | 'dark'
  colors: SemanticColors
  onTap: () => void
  onInstall: () => void
  isInstalling?: boolean
  installDisabled?: boolean
}

const FeaturedCard = ({
  plugin,
  actualMode,
  colors,
  onTap,
  onInstall,
  isInstalling = false,
  installDisabled = false,
}: FeaturedCardProps) => {
  const cardGlass = actualMode === 'dark' ? DARK_FEATURED_GLASS : LIGHT_FEATURED_GLASS

  return (
    <VStack
      frame={{ width: CARD_WIDTH, minHeight: 146 }}
      glassEffect={{
        glass: cardGlass,
        shape: { type: 'rect', cornerRadius: 28, style: 'continuous' },
      }}
      shadow={{ color: 'rgba(20,35,70,0.14)', radius: 8, y: 3 }}
      alignment="leading"
      spacing={spacing.sm}
    >
      <VStack
        padding={{ leading: spacing.lg, trailing: spacing.lg, top: spacing.sm }}
        alignment="leading"
        spacing={spacing.sm}
        contentShape="rect"
        onTapGesture={onTap}
      >
        <HStack alignment="center" spacing={spacing.md} frame={{ maxWidth: 'infinity' }}>
          <PluginSummary
            plugin={plugin}
            colors={colors}
            title={plugin.name}
            iconSize="medium"
            titleFont={fontSize.title3}
            titleWeight="bold"
            titleLineLimit={1}
            spacing={spacing.md}
          />
          <FavoriteButton pluginId={plugin.id} />
        </HStack>

        <PluginSummary
          plugin={plugin}
          colors={colors}
          title={plugin.description || '探索这款精彩脚本'}
          showIcon={false}
          titleFont={fontSize.footnote}
          titleWeight="medium"
          titleColor="secondaryLabel"
          titleLineLimit={1}
          spacing={0}
        />
      </VStack>

      <HStack
        padding={{ leading: spacing.lg, trailing: spacing.lg, top: spacing.sm, bottom: spacing.sm }}
        alignment="center"
        spacing={spacing.md}
      >
        <PressableRow onPress={onTap}>
          <PluginSummary
            plugin={plugin}
            colors={colors}
            showIcon={false}
            title={formatAuthorNames(plugin.author || '未知作者')}
            subtitle={`更新于 ${plugin.updateTime || '未知'}`}
            titleFont={fontSize.footnote}
            subtitleFont={fontSize.caption2}
            titleWeight="semibold"
            titleColor="secondaryLabel"
            subtitleColor="tertiaryLabel"
            spacing={spacing.sm}
          />
        </PressableRow>

        <GetButton
          tint={colors.tint}
          onPress={onInstall}
          isLoading={isInstalling}
          disabled={installDisabled}
        />
      </HStack>
    </VStack>
  )
}

const FeaturedTrack = ({
  proxy,
  plugins,
  actualMode,
  colors,
  onInstall,
  onDetail,
  installingPluginKey = null,
  isPaused = false,
}: FeaturedTrackProps) => {
  const {
    trackItems,
    isScrollLocked,
    handleVisibleItemsChanged,
    handleItemActivated,
    handleAppear,
    handleDisappear,
    handleManualDragChanged,
    handleManualDragEnded,
  } = useFeaturedCarousel({
    proxy,
    plugins,
    itemStride: CARD_STRIDE,
    speed: MARQUEE_SPEED,
    isPaused,
  })

  if (plugins.length === 0) return <VStack />

  const hasActiveInstall = Boolean(installingPluginKey)

  return (
    <VStack
      frame={{ width: Device.screen.width }}
      alignment="leading"
      padding={{ leading: -16, trailing: -16 }}
      listRowInsets={0}
      listRowSeparator="hidden"
      listRowBackground={<Rectangle fill="rgba(0,0,0,0)" />}
    >
      <ScrollView
        axes="horizontal"
        scrollDisabled={isScrollLocked}
        scrollIndicator="hidden"
        scrollClipDisabled={false}
        onScrollTargetVisibilityChange={{
          idType: 'string',
          threshold: 0.5,
          onChanged: handleVisibleItemsChanged,
        }}
        frame={{ height: TRACK_HEIGHT }}
        onAppear={handleAppear}
        onDisappear={handleDisappear}
        simultaneousGesture={
          DragGesture({ minDistance: 0 })
            .onChanged(handleManualDragChanged)
            .onEnded(handleManualDragEnded)
        }
      >
        <HStack
          spacing={CARD_GAP}
          scrollTargetLayout
          padding={{ top: spacing.xs, bottom: spacing.sm }}
        >
          {trackItems.map(item => {
            const pluginKey = getPluginKey(item.plugin)
            return (
              <FeaturedCard
                key={item.key}
                plugin={item.plugin}
                actualMode={actualMode}
                colors={colors}
                onTap={() => {
                  handleItemActivated(item.key)
                  onDetail(item.plugin)
                }}
                onInstall={() => {
                  handleItemActivated(item.key)
                  onInstall(item.plugin)
                }}
                isInstalling={installingPluginKey === pluginKey}
                installDisabled={hasActiveInstall}
              />
            )
          })}
        </HStack>
      </ScrollView>
    </VStack>
  )
}

export const FeaturedSection = (props: FeaturedSectionProps) => {
  return (
    <ScrollViewReader>
      {proxy => <FeaturedTrack {...props} proxy={proxy} />}
    </ScrollViewReader>
  )
}
