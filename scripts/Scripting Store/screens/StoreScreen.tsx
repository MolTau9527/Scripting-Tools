/**
 * Store 主屏幕
 * 整合所有组件，管理状态和数据流
 */

import {
  Button,
  HStack,
  Image,
  Navigation,
  Spacer,
  Text,
  VStack,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'scripting'
import { fetchConfig, fetchPlugins } from '../api'
import { MyProfile, PluginDetail, PluginList, SearchBar, SubmitForm } from '../components'
import type { LoadingState, Plugin, SiteConfig, SortType } from '../types'
import { installPlugin } from '../utils/installer'

/**
 * Store 主屏幕组件
 */
export const StoreScreen = () => {
  const dismiss = Navigation.useDismiss()

  // 状态
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortType, setSortType] = useState<SortType>('time')
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<SiteConfig>({
    bannerTitle: '插件中心',
    bannerSubtitle: '只为Scripting打造'
  })

  /**
   * 加载数据
   */
  const loadData = useCallback(async () => {
    setLoadingState('loading')
    setError(null)

    try {
      const [pluginsData, configData] = await Promise.all([
        fetchPlugins(),
        fetchConfig()
      ])

      setPlugins(pluginsData)
      setConfig(configData)
      setLoadingState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
      setLoadingState('error')
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    loadData()
  }, [loadData])

  /**
   * 过滤和排序插件
   */
  const filteredPlugins = useMemo(() => {
    let result = [...plugins]

    // 搜索过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        plugin =>
          plugin.name.toLowerCase().includes(term) ||
          plugin.description.toLowerCase().includes(term)
      )
    }

    // 排序
    if (sortType === 'time') {
      result.sort((a, b) => {
        const dateA = new Date(a.updateTime)
        const dateB = new Date(b.updateTime)
        return dateB.getTime() - dateA.getTime()
      })
    } else if (sortType === 'popular') {
      result.sort((a, b) => {
        const countA = a.installCount || 0
        const countB = b.installCount || 0
        return countB - countA
      })
    }

    return result
  }, [plugins, searchTerm, sortType])

  /**
   * 处理安装
   */
  const handleInstall = useCallback((plugin: Plugin) => {
    installPlugin(plugin)
  }, [])

  /**
   * 显示插件详情
   */
  const handleShowDetail = useCallback(async (plugin: Plugin) => {
    await Navigation.present({
      element: (
        <PluginDetail
          plugin={plugin}
          onInstall={handleInstall}
        />
      ),
      modalPresentationStyle: 'pageSheet'
    })
  }, [handleInstall])

  /**
   * 显示发布表单
   */
  const handleShowSubmitForm = useCallback(async () => {
    await Navigation.present({
      element: <SubmitForm onSuccess={loadData} />,
      modalPresentationStyle: 'pageSheet'
    })
  }, [loadData])

  /**
   * 显示我的页面
   */
  const handleShowMyProfile = useCallback(async () => {
    await Navigation.present({
      element: <MyProfile plugins={plugins} onRefresh={loadData} />,
      modalPresentationStyle: 'pageSheet'
    })
  }, [plugins, loadData])

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      background={{
        colors: ['#fdf2f8', '#fce7f3', '#fbcfe8'],
        startPoint: 'top',
        endPoint: 'bottom'
      }}
      ignoresSafeArea={{ edges: 'all' }}
    >
      {/* 头部横幅 */}
      <VStack
        padding={{ leading: 16, trailing: 16, top: 60, bottom: 16 }}
        background={{
          colors: ['#1e3a5f', '#2d5a87'],
          startPoint: 'topLeading',
          endPoint: 'bottomTrailing'
        }}
        frame={{ maxWidth: 'infinity' }}
      >
        <HStack alignment="center">
          <VStack alignment="leading" spacing={4}>
            <Text
              font={28}
              fontWeight="bold"
              foregroundStyle="#ffffff"
            >
              {config.bannerTitle}
            </Text>
            <Text
              font={14}
              foregroundStyle="rgba(255,255,255,0.8)"
            >
              {config.bannerSubtitle}
            </Text>
            <HStack spacing={4} alignment="center">
              <Text
                font={12}
                foregroundStyle="rgba(255,255,255,0.6)"
              >
                感谢原作者提供网页服务
              </Text>
              <Button action={() => Safari.openURL('https://gallery.scripting.fun')}>
                <Text
                  font={12}
                  foregroundStyle="#ffffff"
                  underline="#ffffff"
                >
                  点击跳转网页版
                </Text>
              </Button>
            </HStack>
          </VStack>
          <Spacer />
          {/* 退出按钮 */}
          <Button action={() => dismiss()}>
            <HStack
              padding={{ leading: 12, trailing: 12, top: 8, bottom: 8 }}
              background="rgba(255,255,255,0.2)"
              clipShape={{ type: 'rect', cornerRadius: 16 }}
              alignment="center"
              spacing={4}
            >
              <Image
                systemName="xmark"
                foregroundStyle="#ffffff"
                frame={{ width: 14, height: 14 }}
              />
              <Text
                font={14}
                fontWeight="medium"
                foregroundStyle="#ffffff"
              >
                退出
              </Text>
            </HStack>
          </Button>
        </HStack>
      </VStack>

      {/* 搜索和排序 */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortType={sortType}
        onSortChange={setSortType}
        onSubmit={handleShowSubmitForm}
        onMyProfile={handleShowMyProfile}
      />

      {/* 插件列表 */}
      <PluginList
        plugins={filteredPlugins}
        loadingState={loadingState}
        error={error}
        onInstall={handleInstall}
        onDetail={handleShowDetail}
        onRefresh={loadData}
      />
    </VStack>
  )
}
