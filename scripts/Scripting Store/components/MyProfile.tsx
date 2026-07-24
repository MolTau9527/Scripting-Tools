import { Button, Circle, ContentUnavailableView, Divider, HStack, Image, List, Navigation, NavigationStack, Section, Text, Toggle, VStack, ZStack, useState, useEffect, useMemo } from 'scripting'

// Dialog 由 Scripting 运行时注入，类型未从 'scripting' 导出，通过 declare 声明。
declare const Dialog: {
  alert: (options: { message: string; title?: string; buttonLabel?: string }) => Promise<void>
  prompt: (options: { message: string; title?: string; defaultValue?: string; placeholder?: string }) => Promise<string | null>
}

// Photos 是 Scripting 注入的全局 namespace，不从 'scripting' 导入。
import { useTheme } from '../contexts/ThemeContext'
import { FavoriteButton } from './common/FavoriteButton'
import { GetButton } from './common/GetButton'
import { ProfileWorkRow } from './common/ProfileWorkRow'
import { ThemeRowBackground } from './common/ThemeRowBackground'
import { GlassBackground } from './common/GlassBackground'
import { InputField } from './common/InputField'
import { PluginDetailModal } from './PluginDetailModal'
import { getUserSettings, saveUserSettings, loadDefaultAvatar, resetUserSettings, subscribeFavoriteChange } from '../utils/userSettings'
import { getApiBaseUrl, setApiBaseUrl } from '../utils/apiConfig'
import { spacing, fontSize } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import { usePluginInstaller } from '../hooks/usePluginInstaller'
import type { Plugin, UserSettings } from '../types'
import { pluginHasAuthor } from '../utils/author'

// ============================================================
// Types
// ============================================================

interface MyProfileProps {
  plugins: Plugin[]
}

// ============================================================
// Component
// ============================================================

export const MyProfile = ({ plugins }: MyProfileProps) => {
  const dismiss = Navigation.useDismiss()
  const { actualMode, colors } = useTheme()
  const [settings, setSettings] = useState<UserSettings>(getUserSettings)
  const [isResetConfirmationPresented, setIsResetConfirmationPresented] = useState(false)
  const {
    installingPluginKey,
    hasActiveInstall,
    startInstall,
  } = usePluginInstaller()

  // 详情卡直接挂在本页 List 的 overlay 上：在设置页内展示，
  // 关闭后停留在设置页，不收起 sheet。
  const [detailPlugin, setDetailPlugin] = useState<Plugin | null>(null)

  const handleDetail = (plugin: Plugin) => {
    setDetailPlugin(plugin)
  }

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
    const followedIds = new Set(settings.followedPlugins)
    return plugins.filter(p => followedIds.has(String(p.id)))
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

  const resetProfile = async () => {
    const newSettings = resetUserSettings()
    const avatar = await loadDefaultAvatar()
    if (avatar) setSettings(saveUserSettings({ avatar }))
    else setSettings(newSettings)
  }

  const handleChangeApiUrl = async () => {
    const currentUrl = getApiBaseUrl()
    try {
      const newUrl = await Dialog.prompt({
        title: '更换后端地址',
        message: '请输入新的 http(s) API 地址',
        defaultValue: currentUrl,
        placeholder: 'https://example.com',
      })

      if (newUrl === null) return // 用户取消

      const trimmed = newUrl.trim()
      if (trimmed.length === 0) {
        await Dialog.alert({ title: '提示', message: '地址不能为空' })
        return
      }

      setApiBaseUrl(trimmed)
      await Dialog.alert({ title: '成功', message: '后端地址已更新，即将刷新数据' })

      // 关闭设置页，触发主页刷新
      dismiss()
    } catch (error) {
      console.error('Change API URL failed:', error)
      await Dialog.alert({
        title: '地址无效',
        message: error instanceof Error ? error.message : '后端地址更新失败',
      })
    }
  }

  return (
    <NavigationStack
      preferredColorScheme={actualMode}
      tint={colors.tint}
      foregroundStyle={colors.label}
      toolbarColorScheme={{ colorScheme: actualMode, bars: ['navigationBar'] }}
    >
      <List
        listStyle="plain"
        preferredColorScheme={actualMode}
        scrollContentBackground="hidden"
        background={<GlassBackground />}
        foregroundStyle={colors.label}
        tint={colors.tint}
        listRowSpacing={12}
        overlay={detailPlugin ? (
          <PluginDetailModal
            plugin={detailPlugin}
            actualMode={actualMode}
            colors={colors}
            onInstall={startInstall}
            onClose={() => setDetailPlugin(null)}
            isInstalling={installingPluginKey === getPluginKey(detailPlugin)}
            installDisabled={Boolean(installingPluginKey)}
          />
        ) : undefined}
        contentMargins={{ edges: 'horizontal', insets: 16, placement: 'scrollContent' }}
        navigationBarTitleDisplayMode="inline"
        toolbar={{
          cancellationAction: <Button title="关闭" role="close" action={() => dismiss()} />,
          topBarTrailing: (
            <Button
              title="更换后端"
              systemImage="link"
              labelStyle="iconOnly"
              action={handleChangeApiUrl}
              accessibilityLabel="更换后端地址"
            />
          ),
        }}
      >
        <Section
          listRowBackground={<ThemeRowBackground variant="elevated" />}
          header={<Text foregroundStyle={colors.secondaryLabel}>个人资料</Text>}
        >
          <Button action={pickAvatar} accessibilityLabel="选择头像">
            <HStack spacing={spacing.lg} alignment="center" padding={{ top: spacing.sm, bottom: spacing.sm }}>
              {/* 头像 + tint 光环 + 相机角标（提示可点击更换） */}
              <ZStack alignment="bottomTrailing">
                <ZStack alignment="center">
                  <Circle fill={colors.tint} frame={{ width: 72, height: 72 }} opacity={0.85} />
                  {settings.avatar && (settings.avatar.startsWith('data:') || settings.avatar.startsWith('http')) ? (
                    <Image imageUrl={settings.avatar} resizable frame={{ width: 64, height: 64 }} clipShape="circle" />
                  ) : (
                    <VStack frame={{ width: 64, height: 64 }} background={colors.tertiaryFill} clipShape="circle" alignment="center">
                      <Image systemName="person.fill" foregroundStyle={colors.tertiaryLabel} frame={{ width: 30, height: 30 }} />
                    </VStack>
                  )}
                </ZStack>
                <ZStack alignment="center">
                  <Circle fill={colors.secondaryBackground} frame={{ width: 24, height: 24 }} />
                  <Image systemName="camera.fill" foregroundStyle={colors.tint} frame={{ width: 13, height: 13 }} />
                </ZStack>
              </ZStack>
              <VStack alignment="leading" spacing={spacing.xs}>
                <Text font={fontSize.title3} fontWeight="bold">{settings.authorName || '未设置昵称'}</Text>
                <Text font={fontSize.footnote} foregroundStyle={colors.secondaryLabel}>
                  {myPlugins.length} 个作品 · {followedPlugins.length} 个关注
                </Text>
              </VStack>
            </HStack>
          </Button>
        </Section>

        <Section
          listRowBackground={<ThemeRowBackground />}
          header={<Text foregroundStyle={colors.secondaryLabel}>发布设置</Text>}
        >
          {/* 单行 VStack：整个分区共享同一块液态玻璃；每行前置 tint 图标，统一 44pt 行高 */}
          <VStack spacing={0} frame={{ maxWidth: 'infinity' }}>
            <HStack spacing={spacing.md} alignment="center" padding={{ top: spacing.sm, bottom: spacing.sm }} frame={{ minHeight: 44 }}>
              <Image systemName="person.crop.circle" foregroundStyle={colors.tint} frame={{ width: 22, height: 22 }} />
              <InputField
                title="作者名"
                placeholder="请输入作者名"
                value={settings.authorName}
                onChanged={(value) => setSettings(saveUserSettings({ authorName: value }))}
              />
            </HStack>
            <Divider />
            <HStack spacing={spacing.md} alignment="center" padding={{ top: spacing.sm, bottom: spacing.sm }} frame={{ minHeight: 44 }}>
              <Image systemName="link" foregroundStyle={colors.tint} frame={{ width: 22, height: 22 }} />
              <InputField
                title="个人主页"
                placeholder="可选"
                value={settings.repoUrl}
                onChanged={(value) => setSettings(saveUserSettings({ repoUrl: value }))}
                textInputAutocapitalization="never"
                autocorrectionDisabled
                keyboardType="URL"
                textContentType="URL"
              />
            </HStack>
            <Divider />
            <HStack spacing={spacing.md} alignment="center" padding={{ top: spacing.sm, bottom: spacing.sm }} frame={{ minHeight: 44 }}>
              <Image systemName="square.and.pencil" foregroundStyle={colors.tint} frame={{ width: 22, height: 22 }} />
              <Toggle
                title="发布时自动填写作者名"
                value={settings.applyAuthorToPublish}
                onChanged={(value) => setSettings(saveUserSettings({ applyAuthorToPublish: value }))}
              />
            </HStack>
            <Divider />
            <Button
              role="destructive"
              buttonStyle="plain"
              action={() => setIsResetConfirmationPresented(true)}
              confirmationDialog={{
                isPresented: isResetConfirmationPresented,
                onChanged: setIsResetConfirmationPresented,
                title: '清空个人信息？',
                message: <Text>作者名、个人主页、头像和关注列表将恢复为默认值。</Text>,
                actions: (
                  <Button
                    title="确认清空"
                    role="destructive"
                    action={resetProfile}
                  />
                ),
              }}
            >
              {/* 红色警示：不依赖系统 destructive 着色，显式使用主题红 */}
              <HStack
                spacing={spacing.md}
                alignment="center"
                frame={{ maxWidth: 'infinity', minHeight: 44, alignment: 'leading' }}
                padding={{ top: spacing.xs, bottom: spacing.xs }}
                contentShape="rect"
              >
                <Image systemName="trash.fill" foregroundStyle={colors.systemRed} frame={{ width: 22, height: 22 }} />
                <Text font={fontSize.body} fontWeight="medium" foregroundStyle={colors.systemRed}>清空所有信息</Text>
              </HStack>
            </Button>
          </VStack>
        </Section>

        <Section listRowBackground={<ThemeRowBackground />} header={<Text foregroundStyle={colors.secondaryLabel}>我的作品</Text>}>
          {!settings.authorName ? (
            <ContentUnavailableView
              title="请先设置作者名"
              systemImage="person.crop.circle.badge.questionmark"
            />
          ) : myPlugins.length === 0 ? (
            <ContentUnavailableView title="暂无作品" systemImage="doc.text.magnifyingglass" />
          ) : (
            myPlugins.map((plugin) => {
              const pluginKey = getPluginKey(plugin)

              return (
                <ProfileWorkRow
                  key={pluginKey}
                  plugin={plugin}
                  colors={colors}
                  subtitle={plugin.description || '暂无描述'}
                  onPress={() => handleDetail(plugin)}
                  trailing={(
                    <GetButton
                      tint={colors.tint}
                      onPress={() => startInstall(plugin)}
                      isLoading={installingPluginKey === pluginKey}
                      disabled={hasActiveInstall}
                    />
                  )}
                />
              )
            })
          )}
        </Section>

        <Section listRowBackground={<ThemeRowBackground />} header={<Text foregroundStyle={colors.secondaryLabel}>关注作品</Text>}>
          {followedPlugins.length === 0 ? (
            <ContentUnavailableView title="暂无关注" systemImage="star" />
          ) : (
            followedPlugins.map((plugin) => {
              const pluginKey = getPluginKey(plugin)

              return (
                <ProfileWorkRow
                  key={pluginKey}
                  plugin={plugin}
                  colors={colors}
                  subtitle={plugin.author}
                  onPress={() => handleDetail(plugin)}
                  trailing={(
                    <HStack spacing={spacing.sm}>
                      <FavoriteButton pluginId={plugin.id} />
                      <GetButton
                        tint={colors.tint}
                        onPress={() => startInstall(plugin)}
                        isLoading={installingPluginKey === pluginKey}
                        disabled={hasActiveInstall}
                      />
                    </HStack>
                  )}
                />
              )
            })
          )}
        </Section>
      </List>
    </NavigationStack>
  )
}
