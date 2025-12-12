import { Image, ProgressView, ScrollView, Text, VStack, useState } from 'scripting'
import type { LoadingState, Plugin } from '../types'
import type { ThemeMode } from '../utils/theme'
import { PluginCard } from './PluginCard'

interface PluginListProps {
  plugins: Plugin[]
  loadingState: LoadingState
  error: string | null
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  onRefresh: () => void
  themeMode: ThemeMode
}

const EmptyState = ({ message, icon }: { message: string; icon: string }) => (
  <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} spacing={16} alignment="center">
    <Image systemName={icon} foregroundStyle="#9ca3af" frame={{ width: 48, height: 48 }} />
    <Text font={16} foregroundStyle="#6b7280">{message}</Text>
  </VStack>
)

const LoadingView = () => (
  <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} spacing={16} alignment="center">
    <ProgressView />
    <Text font={16} foregroundStyle="#6b7280">加载中...</Text>
  </VStack>
)

const ErrorView = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} spacing={16} alignment="center" onTapGesture={onRetry}>
    <Image systemName="exclamationmark.circle" foregroundStyle="#ef4444" frame={{ width: 48, height: 48 }} />
    <Text font={16} foregroundStyle="#6b7280">{message}</Text>
    <Text font={14} foregroundStyle="#007aff">点击重试</Text>
  </VStack>
)

export const PluginList = ({ plugins, loadingState, error, onInstall, onDetail, onRefresh, themeMode }: PluginListProps) => {
  const [, setRefresh] = useState(0)

  if (loadingState === 'loading') {
    return <LoadingView />
  }

  if (loadingState === 'error' && error) {
    return <ErrorView message={error} onRetry={onRefresh} />
  }

  if (plugins.length === 0) {
    return <EmptyState message="未找到匹配的插件" icon="magnifyingglass" />
  }

  return (
    <ScrollView scrollDismissesKeyboard="interactively">
      <VStack padding={16} spacing={12}>
        {plugins.map(plugin => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            onInstall={onInstall}
            onDetail={onDetail}
            themeMode={themeMode}
            onFollowChange={() => setRefresh(n => n + 1)}
          />
        ))}
      </VStack>
    </ScrollView>
  )
}