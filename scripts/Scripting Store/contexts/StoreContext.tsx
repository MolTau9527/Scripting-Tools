import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'scripting'
import { fetchPlugins, fetchConfig } from '../api'
import type { Plugin, SiteConfig, SortType } from '../types'

// ============================================================
// Types
// ============================================================

export type StoreStatus = 'idle' | 'loading' | 'success' | 'error' | 'refreshing'

export interface StoreState {
  status: StoreStatus
  plugins: Plugin[]
  config: SiteConfig
  error: string | null
  lastFetch: number | null
}

export interface StoreContextValue extends StoreState {
  refresh: () => Promise<void>
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_CONFIG: SiteConfig = {
  bannerTitle: '插件商店',
  bannerSubtitle: '发现精彩脚本',
}

const INITIAL_STATE: StoreState = {
  status: 'idle',
  plugins: [],
  config: DEFAULT_CONFIG,
  error: null,
  lastFetch: null,
}

const parseUpdateTime = (value: string): number => {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

// ============================================================
// Context
// ============================================================

const StoreContext = createContext<StoreContextValue>()

export const StoreProvider = ({ children }: { children: JSX.Element }) => {
  const [state, setState] = useState<StoreState>(INITIAL_STATE)
  const requestIdRef = useRef(0)
  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current

    setState(prev => ({
      ...prev,
      status: prev.plugins.length > 0 ? 'refreshing' : 'loading',
      error: null,
    }))

    try {
      const [plugins, configData] = await Promise.all([
        fetchPlugins(),
        fetchConfig(),
      ])

      if (!isMountedRef.current || requestIdRef.current !== currentRequestId) return

      setState({
        status: 'success',
        plugins,
        config: { ...DEFAULT_CONFIG, ...configData },
        error: null,
        lastFetch: Date.now(),
      })
    } catch (err) {
      if (!isMountedRef.current || requestIdRef.current !== currentRequestId) return

      setState(prev => ({
        ...prev,
        status: prev.plugins.length > 0 ? 'success' : 'error',
        error: err instanceof Error ? err.message : '加载失败',
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
    return () => { isMountedRef.current = false }
  }, [refresh])

  const value = useMemo<StoreContextValue>(() => ({
    ...state,
    refresh,
  }), [state, refresh])

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

// ============================================================
// Hooks
// ============================================================

export const useStore = (): StoreContextValue => {
  return useContext(StoreContext)
}

export const usePlugins = (): Plugin[] => {
  return useStore().plugins
}

export const useConfig = (): SiteConfig => {
  return useStore().config
}

export const useStoreStatus = () => {
  const { status, error, refresh } = useStore()
  return { status, error, refresh, isLoading: status === 'loading' || status === 'refreshing' }
}

// ============================================================
// Query Hook - 筛选和排序（预计算 + 预排序缓存）
// ============================================================

export interface PluginQueryOptions {
  searchTerm?: string
  sortType?: SortType
  authorFilter?: string
  followedOnly?: boolean
  followedIds?: string[]
}

interface IndexedPlugin {
  plugin: Plugin
  searchText: string
  updateTimestamp: number
}

const useIndexedPlugins = () => {
  const plugins = usePlugins()

  return useMemo(() =>
    plugins.map(p => ({
      plugin: p,
      searchText: `${p.name || ''}\0${p.description || ''}\0${p.author || ''}`.toLowerCase(),
      updateTimestamp: parseUpdateTime(p.updateTime),
    })),
  [plugins])
}

const useSortedPlugins = () => {
  const indexed = useIndexedPlugins()

  return useMemo(() => ({
    byTime: [...indexed].sort((a, b) => b.updateTimestamp - a.updateTimestamp),
    byPopular: [...indexed].sort((a, b) => (b.plugin.installCount || 0) - (a.plugin.installCount || 0)),
  }), [indexed])
}

export const usePluginQuery = (options: PluginQueryOptions = {}): Plugin[] => {
  const sorted = useSortedPlugins()

  return useMemo(() => {
    const sortType = options.sortType || 'time'
    let result = sortType === 'time' ? sorted.byTime : sorted.byPopular

    if (options.searchTerm?.trim()) {
      const term = options.searchTerm.toLowerCase()
      result = result.filter(item => item.searchText.includes(term))
    }

    if (options.authorFilter) {
      const author = options.authorFilter.toLowerCase()
      result = result.filter(item => item.plugin.author?.toLowerCase().includes(author))
    }

    if (options.followedOnly && options.followedIds) {
      result = result.filter(item => options.followedIds!.includes(String(item.plugin.id)))
    }

    return result.map(item => item.plugin)
  }, [sorted, options.searchTerm, options.sortType, options.authorFilter, options.followedOnly, options.followedIds])
}

export const useFeaturedPlugins = (): Plugin[] => {
  const sorted = useSortedPlugins()

  return useMemo(() => {
    return sorted.byTime.slice(0, 5).map(item => item.plugin)
  }, [sorted])
}
