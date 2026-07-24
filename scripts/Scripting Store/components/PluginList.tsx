import { Button, ContentUnavailableView, HStack, ProgressView, Rectangle, Section, Text, VStack } from 'scripting'
import { useStoreStatus } from '../contexts/StoreContext'
import type { SemanticColors } from '../contexts/ThemeContext'
import { PluginCard } from './PluginCard'
import { ThemeRowBackground } from './common/ThemeRowBackground'
import { spacing } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import type { Plugin } from '../types'

interface PluginListProps {
  sectionTitle?: string
  plugins: Plugin[]
  actualMode: 'light' | 'dark'
  colors: SemanticColors
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  installingPluginKey?: string | null
}

export const PluginList = ({
  sectionTitle = '插件',
  plugins,
  actualMode,
  colors,
  onInstall,
  onDetail,
  installingPluginKey = null,
}: PluginListProps) => {
  const { status, error, refresh } = useStoreStatus()
  if (status === 'loading') {
    return (
      <Section listRowBackground={<ThemeRowBackground />}>
        <HStack spacing={spacing.sm} alignment="center">
          <ProgressView />
          <Text foregroundStyle={colors.secondaryLabel}>正在加载插件...</Text>
        </HStack>
      </Section>
    )
  }

  if (status === 'error' && error) {
    return (
      <Section listRowBackground={<ThemeRowBackground />}>
        <VStack spacing={spacing.md} padding={{ top: spacing.lg, bottom: spacing.lg }}>
          <ContentUnavailableView
            title="加载失败"
            systemImage="exclamationmark.triangle"
            description={error}
          />
          <Button
            title="重新加载"
            systemImage="arrow.clockwise"
            buttonStyle="bordered"
            action={refresh}
          />
        </VStack>
      </Section>
    )
  }

  if (plugins.length === 0) {
    return (
      <Section title={sectionTitle} listRowBackground={<ThemeRowBackground />}>
        <ContentUnavailableView
          title="未找到插件"
          systemImage="magnifyingglass"
          description="请尝试其他关键词或排序方式"
        />
      </Section>
    )
  }

  const hasActiveInstall = Boolean(installingPluginKey)

  return (
    <Section title={sectionTitle} listRowBackground={<Rectangle fill="rgba(0,0,0,0)" />}>
      {plugins.map((plugin) => {
        const pluginKey = getPluginKey(plugin)
        const isInstalling = installingPluginKey === pluginKey

        return (
          <PluginCard
            key={pluginKey}
            plugin={plugin}
            actualMode={actualMode}
            colors={colors}
            onInstall={onInstall}
            onDetail={onDetail}
            isInstalling={isInstalling}
            installDisabled={hasActiveInstall}
          />
        )
      })}
    </Section>
  )
}
