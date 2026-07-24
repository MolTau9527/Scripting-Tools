import { AbortController, createContext, useState, useMemo, useCallback, useEffect, useRef, useSelector } from 'scripting'
import { fetchPlugins, fetchConfig } from '../api'
import type { Plugin, SiteConfig } from '../types'
import { arePluginsEqual } from '../utils/plugin'

// ============================================================
// Types
// ============================================================

type StoreStatus = 'loading' | 'success' | 'error'

interface StoreState {
  status: StoreStatus
  plugins: Plugin[]
  config: SiteConfig
  error: string | null
}

interface StoreContextValue extends StoreState {
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
  status: 'loading',
  plugins: [],
  config: DEFAULT_CONFIG,
  error: null,
}

// ============================================================
// Context
// ============================================================

const StoreContext = createContext<StoreContextValue>()

export const StoreProvider = ({ children }: { children: JSX.Element }) => {
  const [state, setState] = useState<StoreState>(INITIAL_STATE)
  const requestIdRef = useRef(0)
  const isMountedRef = useRef(true)
  const pluginAbortControllerRef = useRef<AbortController | null>(null)
  const configAbortControllerRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current
    pluginAbortControllerRef.current?.abort()
    configAbortControllerRef.current?.abort()
    const pluginController = new AbortController()
    const configController = new AbortController()
    pluginAbortControllerRef.current = pluginController
    configAbortControllerRef.current = configController

    // List.refreshable 已提供原生刷新反馈；已有数据时保持快照不变，
    // 避免仅为 refreshing 标记让主屏、卡片和玻璃层整树重渲染。
    setState(prev => {
      if (prev.plugins.length > 0 || (prev.status === 'loading' && prev.error === null)) {
        return prev
      }
      return { ...prev, status: 'loading', error: null }
    })

    // 配置与插件同时请求，但配置在后台独立更新，不延长首屏和下拉刷新 Promise。
    void fetchConfig(configController.signal).then(configData => {
      if (!isMountedRef.current || requestIdRef.current !== currentRequestId) return

      setState(prev => {
        const nextConfig = { ...prev.config, ...configData }
        if (
          prev.config.bannerTitle === nextConfig.bannerTitle &&
          prev.config.bannerSubtitle === nextConfig.bannerSubtitle
        ) {
          return prev
        }
        return { ...prev, config: nextConfig }
      })
    }).catch(() => undefined).finally(() => {
      if (
        requestIdRef.current === currentRequestId &&
        configAbortControllerRef.current === configController
      ) {
        configAbortControllerRef.current = null
      }
    })

    try {
      const plugins = await fetchPlugins(pluginController.signal)

      if (!isMountedRef.current || requestIdRef.current !== currentRequestId) return

      setState(prev => {
        const nextPlugins = arePluginsEqual(prev.plugins, plugins) ? prev.plugins : plugins
        if (prev.status === 'success' && prev.plugins === nextPlugins && prev.error === null) {
          return prev
        }
        return {
          ...prev,
          status: 'success',
          plugins: nextPlugins,
          error: null,
        }
      })

    } catch (err) {
      if (!isMountedRef.current || requestIdRef.current !== currentRequestId) return

      setState(prev => prev.plugins.length > 0
        ? prev
        : {
          ...prev,
          status: 'error',
          error: err instanceof Error ? err.message : '加载失败',
        })
    } finally {
      if (
        requestIdRef.current === currentRequestId &&
        pluginAbortControllerRef.current === pluginController
      ) {
        pluginAbortControllerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    refresh()
    return () => {
      isMountedRef.current = false
      pluginAbortControllerRef.current?.abort()
      configAbortControllerRef.current?.abort()
      pluginAbortControllerRef.current = null
      configAbortControllerRef.current = null
    }
  }, [])  // 空依赖：只在挂载时触发一次初始加载

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

export const useStorePlugins = (): Plugin[] =>
  useSelector(StoreContext, value => value.plugins)

export const useStoreConfig = (): SiteConfig =>
  useSelector(StoreContext, value => value.config)

export const useStoreRefresh = (): (() => Promise<void>) =>
  useSelector(StoreContext, value => value.refresh)

export const useStoreStatus = () => {
  const status = useSelector(StoreContext, value => value.status)
  const error = useSelector(StoreContext, value => value.error)
  const refresh = useSelector(StoreContext, value => value.refresh)
  return { status, error, refresh }
}
