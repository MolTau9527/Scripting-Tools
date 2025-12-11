/**
 * 插件列表组件
 * 显示插件卡片列表，支持空状态和加载状态
 */

import { Image, ProgressView, ScrollView, Text, VStack } from 'scripting'
import type { LoadingState, Plugin } from '../types'
import { PluginCard } from './PluginCard'

interface PluginListProps {
  plugins: Plugin[]
  loadingState: LoadingState
  error: string | null
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  onRefresh: () => void
}

/**
 * 空状态组件
 */
const EmptyState = ({ message, icon }: { message: string; icon: string }) => (
  <VStack
    frame={{ maxWidth: 'infinity', minHeight: 300 }}
    spacing={16}
  >
    <Image
      systemName={icon}
      foregroundStyle="#9ca3af"
      frame={{ width: 48, height: 48 }}
    />
    <Text
      font={16}
      foregroundStyle="#6b7280"
    >
      {message}
    </Text>
  </VStack>
)

/**
 * 加载状态组件
 */
const LoadingView = () => (
  <VStack
    frame={{ maxWidth: 'infinity', minHeight: 300 }}
    spacing={16}
  >
    <ProgressView />
    <Text
      font={16}
      foregroundStyle="#6b7280"
    >
      加载中...
    </Text>
  </VStack>
)

/**
 * 错误状态组件
 */
const ErrorView = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <VStack
    frame={{ maxWidth: 'infinity', minHeight: 300 }}
    spacing={16}
    onTapGesture={onRetry}
  >
    <Image
      systemName="exclamationmark.circle"
      foregroundStyle="#ef4444"
      frame={{ width: 48, height: 48 }}
    />
    <Text
      font={16}
      foregroundStyle="#6b7280"
    >
      {message}
    </Text>
    <Text
      font={14}
      foregroundStyle="#007aff"
    >
      点击重试
    </Text>
  </VStack>
)

/**
 * 插件列表组件
 */
export const PluginList = ({
  plugins,
  loadingState,
  error,
  onInstall,
  onDetail,
  onRefresh
}: PluginListProps) => {
  // 加载中
  if (loadingState === 'loading') {
    return <LoadingView />
  }

  // 错误状态
  if (loadingState === 'error' && error) {
    return <ErrorView message={error} onRetry={onRefresh} />
  }

  // 空列表
  if (plugins.length === 0) {
    return <EmptyState message="未找到匹配的插件" icon="magnifyingglass" />
  }

  // 插件列表
  return (
    <ScrollView scrollDismissesKeyboard="interactively">
      <VStack padding={16} spacing={12}>
        {plugins.map(plugin => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            onInstall={onInstall}
            onDetail={onDetail}
          />
        ))}
      </VStack>
    </ScrollView>
  )
}
