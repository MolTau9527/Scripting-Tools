import { Navigation, ScrollView, Text, VStack } from 'scripting'
import { useTheme } from '../contexts/ThemeContext'
import { ContentCard } from './common/ContentCard'
import { EmptyState } from './common/EmptyState'
import { GetButton } from './common/GetButton'
import { NavigationAction } from './common/NavigationAction'
import { PageHeader } from './common/PageHeader'
import { ProfileWorkRow } from './common/ProfileWorkRow'
import { spacing, fontSize } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import type { Plugin } from '../types'
import { pluginHasAuthor } from '../utils/author'

// ============================================================
// Types
// ============================================================

export interface AuthorProfileProps {
  authorName: string
  plugins: Plugin[]
  onInstall: (plugin: Plugin) => void
  onDetail?: (plugin: Plugin) => void
  installingPluginKey?: string | null
}

// ============================================================
// Component
// ============================================================

export const AuthorProfile = ({
  authorName,
  plugins,
  onInstall,
  onDetail,
  installingPluginKey = null,
}: AuthorProfileProps) => {
  const dismiss = Navigation.useDismiss()
  const { actualMode, colors } = useTheme()
  const authorPlugins = plugins.filter(p =>
    pluginHasAuthor(p.author, authorName)
  )

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      background={colors.secondaryBackground}
      preferredColorScheme={actualMode}
    >
      <PageHeader
        title={authorName}
        leading={<NavigationAction type="back" onPress={() => dismiss()} />}
      />

      <ScrollView>
        <VStack padding={spacing.lg} spacing={spacing.lg}>
          {/* Works Section */}
          <ContentCard>
            <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>
              {authorName} 的作品 ({authorPlugins.length})
            </Text>

            {authorPlugins.length === 0 ? (
              <EmptyState icon="doc.text.magnifyingglass" message="暂无作品" />
            ) : (
              <VStack spacing={spacing.sm}>
                {authorPlugins.map((plugin) => {
                  const pluginKey = getPluginKey(plugin)
                  const hasActiveInstall = Boolean(installingPluginKey)

                  return (
                    <ProfileWorkRow
                      key={pluginKey}
                      plugin={plugin}
                      subtitle={plugin.description || '暂无描述'}
                      onPress={() => onDetail?.(plugin)}
                      trailing={(
                        <GetButton
                          onPress={() => onInstall(plugin)}
                          isLoading={installingPluginKey === pluginKey}
                          disabled={hasActiveInstall}
                        />
                      )}
                    />
                  )
                })}
              </VStack>
            )}
          </ContentCard>
        </VStack>
      </ScrollView>
    </VStack>
  )
}
