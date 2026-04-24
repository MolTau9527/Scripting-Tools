import { Button, GeometryReader, GlassEffectContainer, HStack, Image, Navigation, ScrollView, Spacer, Text, VStack, useCallback, useMemo, useState } from 'scripting'
import { ThemeProvider, useTheme, useToggleTheme, getThemeIcon } from '../contexts/ThemeContext'
import { StoreProvider, useStore, usePluginQuery, useConfig } from '../contexts/StoreContext'
import { SearchBar } from '../components/SearchBar'
import { SegmentedControl } from '../components/SegmentedControl'
import { FeaturedSection } from '../components/FeaturedSection'
import { PluginList } from '../components/PluginList'
import { PluginDetail } from '../components/PluginDetail'
import { MyProfile } from '../components/MyProfile'
import { SubmitForm } from '../components/SubmitForm'
import { Changelog } from '../components/Changelog'
import { installPlugin } from '../utils/installer'
import { spacing, fontSize, cornerRadius, createSymmetricPadding, getGradientBackground } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import type { Plugin, SortType } from '../types'

// 运行时全局：Dialog 由 Scripting 注入，不从 'scripting' import（仅类型导出）。
// alert 全局作为兜底。两者都可能在某些版本缺失，因此用 try/catch 包裹。
declare const Dialog: {
  alert: (options: { message: string; title?: string; buttonLabel?: string }) => Promise<void>
} | undefined
declare const alert: ((options: { message: string; title?: string; buttonLabel?: string }) => Promise<void>) | undefined

const showError = async (title: string, message: string) => {
  try {
    if (typeof Dialog !== 'undefined' && Dialog && typeof Dialog.alert === 'function') {
      await Dialog.alert({ title, message })
      return
    }
  } catch (_) { /* fallthrough */ }
  try {
    if (typeof alert === 'function') {
      await alert({ title, message })
      return
    }
  } catch (_) { /* fallthrough */ }
  try { console.error(`[${title}] ${message}`) } catch (_) { /* ignore */ }
}

const StoreContent = () => {
  const dismiss = Navigation.useDismiss()
  const { mode, actualMode, colors } = useTheme()
  const toggleTheme = useToggleTheme()
  const { plugins, refresh } = useStore()
  const config = useConfig()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortType, setSortType] = useState<SortType>('time')
  const [installingPluginKey, setInstallingPluginKey] = useState<string | null>(null)

  const filteredPlugins = usePluginQuery({ searchTerm, sortType })
  const shouldSplitRecentFeed = !searchTerm.trim() && sortType === 'time'
  const featuredPlugins = useMemo(() => {
    return shouldSplitRecentFeed ? filteredPlugins.slice(0, 5) : []
  }, [filteredPlugins, shouldSplitRecentFeed])
  const listPlugins = useMemo(() => {
    return shouldSplitRecentFeed ? filteredPlugins.slice(5) : filteredPlugins
  }, [filteredPlugins, shouldSplitRecentFeed])

  const presentSheet = useCallback(async (element: JSX.Element) => {
    await Navigation.present({
      element: <ThemeProvider>{element}</ThemeProvider>,
      modalPresentationStyle: 'pageSheet',
    })
  }, [])

  const handleInstall = useCallback(async (plugin: Plugin) => {
    const pluginKey = getPluginKey(plugin)
    setInstallingPluginKey(pluginKey)

    try {
      await installPlugin(plugin)
    } catch (error) {
      await showError(
        '安装失败',
        error instanceof Error ? error.message : '安装过程中出现错误',
      )
    } finally {
      setInstallingPluginKey(current => (current === pluginKey ? null : current))
    }
  }, [])

  const handleShowDetail = useCallback(async (plugin: Plugin) => {
    await presentSheet(
      <PluginDetail
        plugin={plugin}
        onInstall={handleInstall}
        plugins={plugins}
        onDetail={handleShowDetail}
        isInstalling={installingPluginKey === getPluginKey(plugin)}
        installDisabled={Boolean(installingPluginKey)}
        installingPluginKey={installingPluginKey}
      />
    )
  }, [handleInstall, installingPluginKey, plugins, presentSheet])

  const handleShowSubmit = useCallback(async () => {
    await presentSheet(<SubmitForm onSuccess={refresh} />)
  }, [presentSheet, refresh])

  const handleShowMyProfile = useCallback(async () => {
    await presentSheet(
      <MyProfile
        plugins={plugins}
        onInstall={handleInstall}
        onDetail={handleShowDetail}
        installingPluginKey={installingPluginKey}
      />
    )
  }, [handleInstall, handleShowDetail, installingPluginKey, plugins, presentSheet])

  const handleShowChangelog = useCallback(async () => {
    await presentSheet(<Changelog />)
  }, [presentSheet])

  return (
    <GlassEffectContainer>
      <GeometryReader>
        {(proxy) => {
          const screenHeight = proxy.size.height
          const isCompact = screenHeight < 700
          const topPadding = Math.max(50, Math.floor(screenHeight * 0.06))
          const titleFont = isCompact ? fontSize.title2 : fontSize.largeTitle
          const subtitleFont = isCompact ? fontSize.footnote : fontSize.subheadline
          const layoutSpacing = isCompact ? 2 : spacing.xs

          return (
            <VStack
              frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
              background={getGradientBackground(actualMode)}
              ignoresSafeArea={{ edges: 'top' }}
              preferredColorScheme={actualMode}
              onTapGesture={() => Keyboard.hide()}
            >
              <VStack frame={{ minHeight: 180 }}>
                <VStack
                  padding={{ leading: spacing.lg, trailing: spacing.lg, top: topPadding, bottom: layoutSpacing }}
                  frame={{ maxWidth: 'infinity' }}
                >
                  <HStack alignment="center">
                    <VStack alignment="leading" spacing={isCompact ? 0 : spacing.xs}>
                      <Text font={titleFont} fontWeight="bold" foregroundStyle={colors.label}>
                        {config.bannerTitle}
                      </Text>
                      <Text font={subtitleFont} foregroundStyle={colors.secondaryLabel}>
                        {config.bannerSubtitle}
                      </Text>
                    </VStack>

                    <Spacer />

                    <VStack spacing={spacing.xs}>
                      <Button action={handleShowChangelog} buttonStyle="plain">
                        <VStack frame={{ width: 36, height: 36 }}>
                          <Image
                            systemName="doc.text"
                            foregroundStyle={colors.tint}
                            frame={{ width: 16, height: 16 }}
                          />
                        </VStack>
                      </Button>
                      <Button action={toggleTheme} buttonStyle="plain">
                        <VStack frame={{ width: 36, height: 36 }}>
                          <Image
                            systemName={getThemeIcon(mode)}
                            foregroundStyle={colors.tint}
                            frame={{ width: 16, height: 16 }}
                          />
                        </VStack>
                      </Button>
                      <Button action={() => dismiss()} buttonStyle="plain">
                        <VStack frame={{ width: 36, height: 36 }}>
                          <Image
                            systemName="xmark"
                            foregroundStyle={colors.secondaryLabel}
                            frame={{ width: 12, height: 12 }}
                            fontWeight="semibold"
                          />
                        </VStack>
                      </Button>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack>
                  <SearchBar
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="搜索插件..."
                  />
                </VStack>

                <HStack
                  padding={{ leading: spacing.lg, trailing: spacing.lg, top: layoutSpacing, bottom: layoutSpacing }}
                  alignment="center"
                >
                  <SegmentedControl value={sortType} onChange={setSortType} />

                  <Spacer />

                  <HStack spacing={spacing.md}>
                    <Button action={handleShowSubmit} buttonStyle="plain">
                      <Text
                        font={fontSize.subheadline}
                        fontWeight="semibold"
                        foregroundStyle="#ffffff"
                        padding={createSymmetricPadding(spacing.sm, spacing.xl)}
                        frame={{ minHeight: 36 }}
                        background={colors.tint}
                        clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
                      >
                        发布
                      </Text>
                    </Button>

                    <Button action={handleShowMyProfile} buttonStyle="plain">
                      <VStack frame={{ width: 44, height: 44 }}>
                        <Image
                          systemName="person.fill"
                          foregroundStyle={colors.tint}
                          frame={{ width: 22, height: 22 }}
                        />
                      </VStack>
                    </Button>
                  </HStack>
                </HStack>
              </VStack>

              <ScrollView scrollDismissesKeyboard="immediately">
                {shouldSplitRecentFeed ? (
                  <FeaturedSection
                    plugins={featuredPlugins}
                    onInstall={handleInstall}
                    onDetail={handleShowDetail}
                    installingPluginKey={installingPluginKey}
                  />
                ) : <VStack />}

                <PluginList
                  plugins={listPlugins}
                  onInstall={handleInstall}
                  onDetail={handleShowDetail}
                  installingPluginKey={installingPluginKey}
                />
              </ScrollView>
            </VStack>
          )
        }}
      </GeometryReader>
    </GlassEffectContainer>
  )
}

export const StoreScreen = () => {
  return (
    <ThemeProvider>
      <StoreProvider>
        <StoreContent />
      </StoreProvider>
    </ThemeProvider>
  )
}
