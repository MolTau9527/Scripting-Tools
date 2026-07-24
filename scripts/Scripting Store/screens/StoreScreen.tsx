import { Button, DefaultToolbarItem, HStack, List, Menu, Navigation, NavigationStack, Rectangle, Script, Section, Text, Toolbar, ToolbarItem, ToolbarSpacer, useCallback, useEffect, useKeyboardVisible, useMemo, useState } from 'scripting'
import { ThemeProvider, useTheme, getThemeIcon, lightThemeOptions } from '../contexts/ThemeContext'
import { StoreProvider, useStoreConfig, useStorePlugins, useStoreRefresh } from '../contexts/StoreContext'
import { usePluginQuery } from '../hooks/usePluginQuery'
import { FeaturedSection } from '../components/FeaturedSection'
import { PluginList } from '../components/PluginList'
import { PluginDetailModal } from '../components/PluginDetailModal'
import { GlassBackground } from '../components/common/GlassBackground'
import { GlassSegmentedControl } from '../components/common/GlassSegmentedControl'
import { spacing } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import { getApiBaseUrl } from '../utils/apiConfig'
import { usePluginInstaller } from '../hooks/usePluginInstaller'
import type { Plugin, SortType } from '../types'

const SEARCH_DISMISS_SETTLE_MS = 300
const SORT_OPTIONS = [
  { value: 'time', label: '最新', icon: 'clock' },
  { value: 'popular', label: '热门', icon: 'flame' },
] as const

const StoreContent = () => {
  const { mode, actualMode, lightTheme, colors, setMode, setLightTheme } = useTheme()
  const plugins = useStorePlugins()
  const config = useStoreConfig()
  const refresh = useStoreRefresh()
  const isKeyboardVisible = useKeyboardVisible()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchPresented, setIsSearchPresented] = useState(false)
  const [isSearchInteractionActive, setIsSearchInteractionActive] = useState(false)
  const [sortType, setSortType] = useState<SortType>('time')
  const [detailModalPlugin, setDetailModalPlugin] = useState<Plugin | null>(null)
  const {
    installingPluginKey,
    hasActiveInstall,
    startInstall: handleInstall,
  } = usePluginInstaller()

  const filteredPlugins = usePluginQuery(plugins, { searchTerm, sortType })
  const shouldSplitRecentFeed = !searchTerm.trim() && sortType === 'time'
  const { featuredPlugins, listPlugins } = useMemo(() => {
    if (!shouldSplitRecentFeed) {
      return { featuredPlugins: [], listPlugins: filteredPlugins }
    }

    return {
      featuredPlugins: filteredPlugins.slice(0, 5),
      listPlugins: filteredPlugins.slice(5),
    }
  }, [filteredPlugins, shouldSplitRecentFeed])

  // 搜索框展开、键盘显示和系统底栏收起动画期间暂停持续轨迹，
  // 避免两个原生长动画同时争用布局与玻璃渲染。工具栏节点始终保持挂载。
  useEffect(() => {
    if (isSearchPresented || isKeyboardVisible) {
      setIsSearchInteractionActive(true)
      return
    }

    const timer = setTimeout(() => {
      setIsSearchInteractionActive(false)
    }, SEARCH_DISMISS_SETTLE_MS)

    return () => clearTimeout(timer)
  }, [isSearchPresented, isKeyboardVisible])

  const presentSheet = useCallback(async (element: JSX.Element) => {
    await Navigation.present({
      element: <ThemeProvider>{element}</ThemeProvider>,
      modalPresentationStyle: 'pageSheet',
    })
  }, [])

  const handleShowDetail = useCallback((plugin: Plugin) => {
    setDetailModalPlugin(plugin)
  }, [])

  const handleShowSubmit = useCallback(async () => {
    const { SubmitForm } = await import('../components/SubmitForm')
    await presentSheet(<SubmitForm onSuccess={refresh} />)
  }, [presentSheet, refresh])

  const handleShowMyProfile = useCallback(async () => {
    const { MyProfile } = await import('../components/MyProfile')
    const previousApiBaseUrl = getApiBaseUrl()
    await presentSheet(
      <MyProfile
        plugins={plugins}
      />
    )
    if (getApiBaseUrl() !== previousApiBaseUrl) {
      await refresh()
    }
  }, [plugins, presentSheet, refresh])

  const handleShowChangelog = useCallback(async () => {
    const { Changelog } = await import('../components/Changelog')
    await presentSheet(<Changelog />)
  }, [presentSheet])

  // 菜单动态图标：主题图标随模式、配色图标随当前浅色主题变化
  const currentLightThemeIcon = lightThemeOptions.find(o => o.value === lightTheme)?.icon ?? 'paintpalette'

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
        contentMargins={{ edges: 'horizontal', insets: 16, placement: 'scrollContent' }}
        navigationTitle={config.bannerTitle}
        navigationBarTitleDisplayMode="large"
        overlay={detailModalPlugin ? (
          <PluginDetailModal
            plugin={detailModalPlugin}
            actualMode={actualMode}
            colors={colors}
            onInstall={handleInstall}
            onClose={() => setDetailModalPlugin(null)}
            isInstalling={installingPluginKey === getPluginKey(detailModalPlugin)}
            installDisabled={hasActiveInstall}
          />
        ) : undefined}
        searchable={{
          value: searchTerm,
          onChanged: setSearchTerm,
          prompt: '搜索插件、作者或描述',
          presented: {
            value: isSearchPresented,
            onChanged: setIsSearchPresented,
          },
          // iOS 26 原生底部搜索：滚动时 minimize 收缩为左下角液态玻璃圆钮，近顶自动展开
          placement: 'toolbar',
        }}
        searchToolbarBehavior="minimize"
        scrollDismissesKeyboard="interactively"
        refreshable={refresh}
        toolbar={
          <Toolbar>
            {/* 显式声明系统搜索项在底部栏 + 弹性占位把它推到左侧：
                系统不再自动放置默认搜索项（消除重复），minimize 收缩圆钮固定左下角 */}
            <DefaultToolbarItem kind="search" placement="bottomBar" />
            <ToolbarSpacer sizing="flexible" placement="bottomBar" />
            <ToolbarItem placement="cancellationAction">
              <Button
                title="关闭"
                systemImage="xmark"
                role="close"
                labelStyle="iconOnly"
                action={() => Script.exit()}
              />
            </ToolbarItem>
            <ToolbarItem placement="topBarTrailing">
              <Button
                title="发布插件"
                systemImage="plus"
                labelStyle="iconOnly"
                action={handleShowSubmit}
              />
            </ToolbarItem>
            <ToolbarItem placement="topBarTrailing">
              <Menu
                title="更多"
                systemImage="ellipsis.circle"
                labelStyle="iconOnly"
                accessibilityLabel="更多操作"
                symbolEffect={{ effect: 'bounce', value: `${actualMode}-${lightTheme}` }}
              >
                <Button title="设置" systemImage="gearshape.fill" action={handleShowMyProfile} />
                <Button title="更新日志" systemImage="sparkles.rectangle.stack" action={handleShowChangelog} />
                <Menu title="主题" systemImage={getThemeIcon(mode)}>
                  <Button
                    title={mode === 'light' ? '浅色（当前）' : '浅色'}
                    systemImage={mode === 'light' ? 'checkmark.circle.fill' : 'sun.max.fill'}
                    action={() => setMode('light')}
                  />
                  <Button
                    title={mode === 'dark' ? '深色（当前）' : '深色'}
                    systemImage={mode === 'dark' ? 'checkmark.circle.fill' : 'moon.fill'}
                    action={() => setMode('dark')}
                  />
                  <Button
                    title={mode === 'system' ? '跟随系统（当前）' : '跟随系统'}
                    systemImage={mode === 'system' ? 'checkmark.circle.fill' : 'circle.lefthalf.filled'}
                    action={() => setMode('system')}
                  />
                </Menu>
                <Menu title="浅色配色" systemImage={currentLightThemeIcon}>
                  {lightThemeOptions.map(option => (
                    <Button
                      key={option.value}
                      title={lightTheme === option.value ? `${option.label}（当前）` : option.label}
                      systemImage={lightTheme === option.value ? 'checkmark.circle.fill' : option.icon}
                      action={() => setLightTheme(option.value)}
                    />
                  ))}
                </Menu>
              </Menu>
            </ToolbarItem>
          </Toolbar>
        }
      >
        <Section
          listRowBackground={<Rectangle fill="rgba(0,0,0,0)" />}
          footer={<Text foregroundStyle={colors.tertiaryLabel}>{config.bannerSubtitle}</Text>}
        >
          {/* 原生液态玻璃分段：不再叠在玻璃行芯片上，整体直接浮在星空背景上 */}
          <HStack
            listRowSeparator="hidden"
            listRowInsets={{ top: spacing.xs, bottom: spacing.xs, leading: 0, trailing: 0 }}
            frame={{ maxWidth: 'infinity' }}
          >
            <GlassSegmentedControl
              options={SORT_OPTIONS}
              value={sortType}
              onChange={(value: SortType) => setSortType(value)}
            />
          </HStack>
        </Section>

        {shouldSplitRecentFeed && featuredPlugins.length > 0 ? (
          <Section
            listRowBackground={<Rectangle fill="rgba(0,0,0,0)" />}
            header={<Text foregroundStyle={colors.secondaryLabel}>最近动态</Text>}
          >
            <FeaturedSection
              plugins={featuredPlugins}
              actualMode={actualMode}
              colors={colors}
              onInstall={handleInstall}
              onDetail={handleShowDetail}
              installingPluginKey={installingPluginKey}
              isPaused={Boolean(detailModalPlugin) || isSearchInteractionActive}
            />
          </Section>
        ) : null}

        {shouldSplitRecentFeed && listPlugins.length === 0 && featuredPlugins.length > 0 ? null : (
          <PluginList
            sectionTitle={searchTerm.trim() ? '搜索结果' : sortType === 'popular' ? '热门插件' : '全部插件'}
            plugins={listPlugins}
            actualMode={actualMode}
            colors={colors}
            onInstall={handleInstall}
            onDetail={handleShowDetail}
            installingPluginKey={installingPluginKey}
          />
        )}
      </List>
    </NavigationStack>
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
