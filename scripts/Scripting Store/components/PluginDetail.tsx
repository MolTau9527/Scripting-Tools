import { HStack, Link, Navigation, ScrollView, Spacer, Text, VStack } from 'scripting'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import { AuthorTagButton } from './common/AuthorTagButton'
import { ContentCard } from './common/ContentCard'
import { NavigationAction } from './common/NavigationAction'
import { PageHeader } from './common/PageHeader'
import { PrimaryCTAButton } from './common/PrimaryCTAButton'
import { PluginIcon } from './common/PluginIcon'
import { AuthorProfile } from './AuthorProfile'
import { spacing, fontSize } from '../utils/styles'
import type { Plugin } from '../types'
import { parseAuthorNames } from '../utils/author'
import { getOriginalImportUrl } from '../utils/importUrl'

// ============================================================
// Types
// ============================================================

export interface PluginDetailProps {
  plugin: Plugin
  onInstall: (plugin: Plugin) => void
  plugins?: Plugin[]
  onDetail?: (plugin: Plugin) => void
  isInstalling?: boolean
  installDisabled?: boolean
  installingPluginKey?: string | null
}

export const PluginDetail = ({ plugin, onInstall, plugins = [], onDetail, isInstalling = false, installDisabled = false, installingPluginKey = null }: PluginDetailProps) => {
  const dismiss = Navigation.useDismiss()
  const { actualMode, colors } = useTheme()
  const authorNames = parseAuthorNames(plugin.author || '脚本作者')
  const originalUrl = getOriginalImportUrl(plugin.url)

  const showAuthorProfile = async (authorName: string) => {
    await Navigation.present({
      element: (
        <ThemeProvider>
          <AuthorProfile
            authorName={authorName}
            plugins={plugins}
            onInstall={onInstall}
            onDetail={onDetail}
            installingPluginKey={installingPluginKey}
          />
        </ThemeProvider>
      ),
      modalPresentationStyle: 'pageSheet',
    })
  }

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      background={colors.secondaryBackground}
      preferredColorScheme={actualMode}
    >
      <PageHeader
        title="插件详情"
        leading={<NavigationAction type="close" onPress={() => dismiss()} />}
        leadingWidth={28}
        trailingWidth={28}
      />

      <ScrollView>
        <VStack padding={spacing.lg} spacing={spacing.lg}>
          {/* Main Info Card */}
          <ContentCard alignment="center">
            <PluginIcon plugin={plugin} size="large" />

            <Text
              font={fontSize.title2}
              fontWeight="bold"
              foregroundStyle={colors.label}
            >
              {plugin.name}
            </Text>

            <HStack spacing={spacing.sm} alignment="center">
              {authorNames.map((authorName) => (
                <AuthorTagButton
                  key={`${plugin.id}-${authorName}`}
                  label={authorName}
                  onPress={() => showAuthorProfile(authorName)}
                />
              ))}
            </HStack>

            <Text font={fontSize.footnote} foregroundStyle={colors.tertiaryLabel}>
              更新于 {plugin.updateTime || '未知'}
            </Text>

            <PrimaryCTAButton
              label={isInstalling ? '安装中...' : '安装插件'}
              icon="arrow.down.circle.fill"
              onPress={() => onInstall(plugin)}
              disabled={installDisabled}
            />
          </ContentCard>

          {/* Description Card */}
          <ContentCard padding={spacing.lg} alignment="leading">
            <Text font={fontSize.body} fontWeight="semibold" foregroundStyle={colors.label}>
              描述
            </Text>
            <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>
              {plugin.description || '暂无描述'}
            </Text>
          </ContentCard>

          {/* Info Card */}
          <ContentCard padding={spacing.lg} alignment="leading">
            <Text font={fontSize.body} fontWeight="semibold" foregroundStyle={colors.label}>
              信息
            </Text>

            <HStack frame={{ maxWidth: 'infinity' }}>
              <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>
                ID
              </Text>
              <Spacer />
              <Text font={fontSize.subheadline} foregroundStyle={colors.label}>
                {String(plugin.id)}
              </Text>
            </HStack>

            {plugin.installCount !== undefined ? (
              <HStack frame={{ maxWidth: 'infinity' }}>
                <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>
                  安装量
                </Text>
                <Spacer />
                <Text font={fontSize.subheadline} foregroundStyle={colors.label}>
                  {String(plugin.installCount)}
                </Text>
              </HStack>
            ) : null}

            <VStack alignment="leading" spacing={spacing.xs}>
              <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>
                原始链接
              </Text>
              <Link url={originalUrl}>
                <Text
                  font={fontSize.caption1}
                  foregroundStyle={colors.tint}
                  multilineTextAlignment="leading"
                >
                  {originalUrl}
                </Text>
              </Link>
            </VStack>
          </ContentCard>
        </VStack>
      </ScrollView>
    </VStack>
  )
}
