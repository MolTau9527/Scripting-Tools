import { Button, HStack, Image, Navigation, ScrollView, Spacer, Text, Toggle, VStack, useState, useEffect, useMemo } from 'scripting'

// Photos 是 Scripting 注入的全局 namespace，不从 'scripting' 导入。
import { useTheme } from '../contexts/ThemeContext'
import { ContentCard } from './common/ContentCard'
import { EmptyState } from './common/EmptyState'
import { FavoriteButton } from './common/FavoriteButton'
import { GetButton } from './common/GetButton'
import { InputField } from './common/InputField'
import { NavigationAction } from './common/NavigationAction'
import { PageHeader } from './common/PageHeader'
import { ProfileWorkRow } from './common/ProfileWorkRow'
import { getUserSettings, saveUserSettings, loadDefaultAvatar, resetUserSettings, subscribeFavoriteChange } from '../utils/userSettings'
import { spacing, fontSize, cornerRadius, getGradientBackground } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import type { Plugin, UserSettings } from '../types'
import { pluginHasAuthor } from '../utils/author'

// ============================================================
// Types
// ============================================================

export interface MyProfileProps {
  plugins: Plugin[]
  onDetail: (plugin: Plugin) => void
  onInstall: (plugin: Plugin) => void
  installingPluginKey?: string | null
}

// ============================================================
// Component
// ============================================================

export const MyProfile = ({ plugins, onDetail, onInstall, installingPluginKey = null }: MyProfileProps) => {
  const dismiss = Navigation.useDismiss()
  const { actualMode, colors } = useTheme()
  const [settings, setSettings] = useState<UserSettings>(getUserSettings())
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (!settings.avatar) {
      loadDefaultAvatar().then(avatar => {
        if (avatar && isMounted) {
          const newSettings = saveUserSettings({ avatar })
          setSettings(newSettings)
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [settings.avatar])

  // 订阅全局收藏变更：在任意页面点收藏后，同步刷新我的页面的 followedPlugins 列表。
  useEffect(() => {
    const unsubscribe = subscribeFavoriteChange(() => {
      setSettings(getUserSettings())
    })
    return unsubscribe
  }, [])

  const myPlugins = useMemo(() => {
    if (!settings.authorName) return []
    return plugins.filter(p => pluginHasAuthor(p.author, settings.authorName))
  }, [settings.authorName, plugins])

  const followedPlugins = useMemo(() => {
    const followedIds = settings.followedPlugins || []
    return plugins.filter(p => followedIds.includes(String(p.id)))
  }, [settings.followedPlugins, plugins])

  const pickAvatar = async () => {
    try {
      const images = await Photos.pickPhotos(1)
      if (images && images.length > 0) {
        const resized = images[0].preparingThumbnail({ width: 128, height: 128 })
        if (resized) {
          const base64 = resized.toJPEGBase64String(0.8)
          if (base64) {
            const newSettings = saveUserSettings({ avatar: `data:image/jpeg;base64,${base64}` })
            setSettings(newSettings)
          }
        }
      }
    } catch (error) {
      console.error('Failed to pick avatar:', error)
    }
  }

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      background={getGradientBackground(actualMode)}
      preferredColorScheme={actualMode}
    >
      <PageHeader
        title="我的"
        leading={<NavigationAction type="back" onPress={() => dismiss()} />}
      />

      <ScrollView>
        <VStack padding={spacing.lg} spacing={spacing.lg}>
          {/* Profile Card */}
          <ContentCard spacing={spacing.lg}>
            <HStack spacing={spacing.lg} alignment="center">
              <Button action={pickAvatar}>
                {settings.avatar && (settings.avatar.startsWith('data:') || settings.avatar.startsWith('http')) ? (
                  <Image imageUrl={settings.avatar} resizable frame={{ width: 64, height: 64 }} clipShape={{ type: 'rect', cornerRadius: 32 }} />
                ) : (
                  <VStack frame={{ width: 64, height: 64 }} background={colors.tertiaryFill} clipShape={{ type: 'rect', cornerRadius: 32 }} alignment="center">
                    <Image systemName="person.fill" foregroundStyle={colors.tertiaryLabel} frame={{ width: 32, height: 32 }} />
                  </VStack>
                )}
              </Button>

              <VStack alignment="leading" spacing={spacing.xs} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
                <Text font={fontSize.title3} fontWeight="semibold" foregroundStyle={colors.label}>{settings.authorName || '未设置昵称'}</Text>
                <Text font={fontSize.footnote} foregroundStyle={colors.secondaryLabel}>{myPlugins.length} 个作品</Text>
              </VStack>
              <Button action={() => setShowSettings(!showSettings)}>
                <Image systemName={showSettings ? 'chevron.up' : 'gearshape'} foregroundStyle={colors.tertiaryLabel} frame={{ width: 20, height: 20 }} />
              </Button>
            </HStack>

            {showSettings ? (
              <VStack padding={spacing.md} background={colors.tertiaryFill} clipShape={{ type: 'rect', cornerRadius: cornerRadius.md }} spacing={spacing.md}>
                <VStack alignment="leading" spacing={spacing.xs}>
                  <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>作者名</Text>
                  <InputField
                    value={settings.authorName}
                    placeholder="请输入作者名"
                    onChanged={(value) => {
                      const newSettings = saveUserSettings({ authorName: value })
                      setSettings(newSettings)
                    }}
                  />
                </VStack>

                <VStack alignment="leading" spacing={spacing.xs}>
                  <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>个人主页</Text>
                  <InputField
                    value={settings.repoUrl}
                    placeholder="请输入个人主页地址"
                    onChanged={(value) => {
                      const newSettings = saveUserSettings({ repoUrl: value })
                      setSettings(newSettings)
                    }}
                    textInputAutocapitalization="never"
                    autocorrectionDisabled
                  />
                </VStack>

                <HStack alignment="center">
                  <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>发布时自动填写作者名</Text>
                  <Spacer />
                  <Toggle title="" value={settings.applyAuthorToPublish} onChanged={(value) => { const newSettings = saveUserSettings({ applyAuthorToPublish: value }); setSettings(newSettings) }} />
                </HStack>

                <Button action={async () => { const newSettings = resetUserSettings(); const avatar = await loadDefaultAvatar(); if (avatar) { const updatedSettings = saveUserSettings({ avatar }); setSettings(updatedSettings) } else { setSettings(newSettings) } }}>
                  <HStack frame={{ maxWidth: 'infinity' }} padding={{ top: spacing.sm, bottom: spacing.sm }} alignment="center">
                    <Text font={fontSize.subheadline} foregroundStyle={colors.systemRed}>清空所有信息</Text>
                  </HStack>
                </Button>
              </VStack>
            ) : null}
          </ContentCard>

          {/* My Works */}
          <ContentCard>
            <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>我的作品</Text>

            {!settings.authorName ? (
              <EmptyState icon="person.crop.circle.badge.questionmark" message="请先设置作者名" />
            ) : myPlugins.length === 0 ? (
              <EmptyState icon="doc.text.magnifyingglass" message="暂无作品" />
            ) : (
              <VStack spacing={spacing.sm}>
                {myPlugins.map((plugin) => {
                  const pluginKey = getPluginKey(plugin)
                  const hasActiveInstall = Boolean(installingPluginKey)

                  return (
                    <ProfileWorkRow
                      key={pluginKey}
                      plugin={plugin}
                      subtitle={plugin.description || '暂无描述'}
                      onPress={() => onDetail(plugin)}
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

          {/* Followed */}
          <ContentCard>
            <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>关注作品</Text>

            {followedPlugins.length === 0 ? (
              <EmptyState icon="star" message="暂无关注" />
            ) : (
              <VStack spacing={spacing.sm}>
                {followedPlugins.map((plugin) => {
                  const pluginKey = getPluginKey(plugin)
                  const hasActiveInstall = Boolean(installingPluginKey)

                  return (
                    <ProfileWorkRow
                      key={pluginKey}
                      plugin={plugin}
                      subtitle={plugin.author}
                      onPress={() => onDetail(plugin)}
                      trailing={(
                        <HStack spacing={spacing.sm}>
                          <FavoriteButton pluginId={plugin.id} />
                          <GetButton
                            onPress={() => onInstall(plugin)}
                            isLoading={installingPluginKey === pluginKey}
                            disabled={hasActiveInstall}
                          />
                        </HStack>
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
