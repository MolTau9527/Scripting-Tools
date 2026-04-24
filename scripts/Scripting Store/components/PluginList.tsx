import { LazyVStack } from 'scripting'
import { useStoreStatus } from '../contexts/StoreContext'
import { PluginCard } from './PluginCard'
import { LoadingView, EmptyView, ErrorView } from './common/LoadingView'
import { spacing } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import type { Plugin } from '../types'

export interface PluginListProps {
  plugins: Plugin[]
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  installingPluginKey?: string | null
}

export const PluginList = ({
  plugins,
  onInstall,
  onDetail,
  installingPluginKey = null,
}: PluginListProps) => {
  const { status, error, refresh } = useStoreStatus()

  if (status === 'loading') {
    return <LoadingView />
  }

  if (status === 'error' && error) {
    return <ErrorView message={error} onRetry={refresh} />
  }

  if (plugins.length === 0) {
    return <EmptyView icon="magnifyingglass" message="未找到匹配的插件" />
  }

  return (
    <LazyVStack padding={spacing.lg} spacing={spacing.md}>
      {plugins.map((plugin) => {
        const pluginKey = getPluginKey(plugin)
        const hasActiveInstall = Boolean(installingPluginKey)
        const isInstalling = installingPluginKey === pluginKey

        return (
          <PluginCard
            key={pluginKey}
            plugin={plugin}
            onInstall={onInstall}
            onDetail={onDetail}
            isInstalling={isInstalling}
            installDisabled={hasActiveInstall}
          />
        )
      })}
    </LazyVStack>
  )
}
