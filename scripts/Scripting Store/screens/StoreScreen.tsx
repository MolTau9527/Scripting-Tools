import { Button, HStack, Image, Navigation, Spacer, Text, VStack, useCallback, useEffect, useMemo, useState } from 'scripting'
import { fetchConfig, fetchPlugins } from '../api'
import { Changelog, MyProfile, PluginDetail, PluginList, SearchBar, SubmitForm } from '../components'
import type { LoadingState, Plugin, SiteConfig, SortType } from '../types'
import { installPlugin } from '../utils/installer'
import { type ThemeMode, getThemeColors, getGradientBackground, getHeaderGradient, getSavedTheme, saveTheme, getActualThemeMode } from '../utils/theme'

export const StoreScreen = () => {
  const dismiss = Navigation.useDismiss()
  const [themeMode, setThemeMode] = useState<ThemeMode>(getSavedTheme())
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortType, setSortType] = useState<SortType>('time')
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<SiteConfig>({ bannerTitle: '插件中心', bannerSubtitle: '只为Scripting打造' })
  const [, forceRefresh] = useState(0)

  const { actualTheme, colors, gradientBg, headerGradient } = useMemo(() => ({
    actualTheme: getActualThemeMode(themeMode),
    colors: getThemeColors(themeMode),
    gradientBg: getGradientBackground(themeMode),
    headerGradient: getHeaderGradient(themeMode)
  }), [themeMode])

  const handleSearchSubmit = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const toggleTheme = useCallback(() => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const newMode = modes[(modes.indexOf(themeMode) + 1) % 3]
    setThemeMode(newMode)
    saveTheme(newMode)
  }, [themeMode])

  const loadData = useCallback(async () => {
    setLoadingState('loading')
    setError(null)
    try {
      const [pluginsData, configData] = await Promise.all([fetchPlugins(), fetchConfig()])
      setPlugins(pluginsData)
      setConfig(configData)
      setLoadingState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
      setLoadingState('error')
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredPlugins = useMemo(() => {
    let result = plugins
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.author.toLowerCase().includes(term))
    }
    return sortType === 'time'
      ? [...result].sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
      : [...result].sort((a, b) => (b.installCount || 0) - (a.installCount || 0))
  }, [plugins, searchTerm, sortType])

  const handleInstall = useCallback((plugin: Plugin) => { installPlugin(plugin) }, [])

  const handleShowDetail = useCallback(async (plugin: Plugin) => {
    await Navigation.present({ element: <PluginDetail plugin={plugin} onInstall={handleInstall} themeMode={themeMode} plugins={plugins} />, modalPresentationStyle: 'pageSheet' })
  }, [handleInstall, themeMode, plugins])

  const handleShowSubmitForm = useCallback(async () => {
    await Navigation.present({ element: <SubmitForm onSuccess={loadData} themeMode={themeMode} />, modalPresentationStyle: 'pageSheet' })
  }, [loadData, themeMode])

  const handleShowMyProfile = useCallback(async () => {
    await Navigation.present({ element: <MyProfile plugins={plugins} onRefresh={loadData} themeMode={themeMode} onDetail={handleShowDetail} onInstall={handleInstall} />, modalPresentationStyle: 'pageSheet' })
    forceRefresh(n => n + 1)
  }, [plugins, loadData, themeMode, handleShowDetail, handleInstall])

  const handleShowChangelog = useCallback(async () => {
    await Navigation.present({ element: <Changelog themeMode={themeMode} />, modalPresentationStyle: 'pageSheet' })
  }, [themeMode])

  return (
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background={gradientBg} ignoresSafeArea={{ edges: 'top' }} preferredColorScheme={actualTheme}>
      <VStack padding={{ leading: 16, trailing: 16, top: 60, bottom: 16 }} background={headerGradient} frame={{ maxWidth: 'infinity' }}>
        <HStack alignment="center">
          <VStack alignment="leading" spacing={4}>
            <Text font={28} fontWeight="bold" foregroundStyle="#ffffff">{config.bannerTitle}</Text>
            <Text font={14} foregroundStyle="rgba(255,255,255,0.8)">{config.bannerSubtitle}</Text>
            <HStack spacing={4} alignment="center">
              <Text font={12} foregroundStyle="rgba(255,255,255,0.6)">感谢原作者提供网页服务</Text>
              <Button action={() => Safari.openURL('https://scripting.oraclecloud.us.kg')}>
                <Text font={12} foregroundStyle="#ffffff" underline="#ffffff">点击跳转网页版</Text>
              </Button>
            </HStack>
          </VStack>
          <Spacer />
          <VStack spacing={8} alignment="trailing">
            <Button action={() => dismiss()}>
              <HStack padding={{ leading: 12, trailing: 12, top: 8, bottom: 8 }} background="rgba(255,255,255,0.2)" clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="center" spacing={4}>
                <Image systemName="xmark" foregroundStyle="#ffffff" frame={{ width: 14, height: 14 }} />
                <Text font={14} fontWeight="medium" foregroundStyle="#ffffff">退出</Text>
              </HStack>
            </Button>
            <Button action={toggleTheme}>
              <HStack padding={{ leading: 12, trailing: 12, top: 8, bottom: 8 }} background="rgba(255,255,255,0.2)" clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="center" spacing={4}>
                <Image systemName={themeMode === 'light' ? 'sun.max.fill' : themeMode === 'dark' ? 'moon.fill' : 'circle.lefthalf.filled'} foregroundStyle="#ffffff" frame={{ width: 14, height: 14 }} />
                <Text font={14} fontWeight="medium" foregroundStyle="#ffffff">{themeMode === 'light' ? '浅色' : themeMode === 'dark' ? '深色' : '跟随'}</Text>
              </HStack>
            </Button>
            <Button action={handleShowChangelog}>
              <HStack padding={{ leading: 12, trailing: 12, top: 8, bottom: 8 }} background="rgba(255,255,255,0.2)" clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="center" spacing={4}>
                <Image systemName="doc.text" foregroundStyle="#ffffff" frame={{ width: 14, height: 14 }} />
                <Text font={14} fontWeight="medium" foregroundStyle="#ffffff">日志</Text>
              </HStack>
            </Button>
          </VStack>
        </HStack>
      </VStack>

      <SearchBar onSearchSubmit={handleSearchSubmit} sortType={sortType} onSortChange={setSortType} onSubmit={handleShowSubmitForm} onMyProfile={handleShowMyProfile} themeMode={themeMode} />
      <PluginList plugins={filteredPlugins} loadingState={loadingState} error={error} onInstall={handleInstall} onDetail={handleShowDetail} onRefresh={loadData} themeMode={themeMode} />
    </VStack>
  )
}