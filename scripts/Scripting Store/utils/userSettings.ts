import type { UserSettings } from '../types'

const STORAGE_KEY = 'scripting_store_user_settings'
const DEFAULT_AVATAR_CACHE_KEY = 'scripting_store_default_avatar_cache'
const DEFAULT_AVATAR_URL = 'https://tjupt.org/bitbucket/160422546887fec40c92246fd1aa5912.png'

const defaultSettings: UserSettings = {
  authorName: '', repoUrl: '', avatar: '', applyAuthorToPublish: false,
  followedPlugins: []
}

type UserSettingsInput = Partial<UserSettings> | null | undefined
type FavoriteChangeListener = () => void
type PluginFavoriteChangeListener = (isFollowed: boolean) => void

let cachedSettings: UserSettings | null = null
let followedPluginIds = new Set<string>()

const normalizeString = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []

  const uniqueValues = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const normalized = item.trim()
    if (!normalized) continue
    uniqueValues.add(normalized)
  }
  return [...uniqueValues]
}

const sanitizeUserSettings = (input: UserSettingsInput): UserSettings => {
  const source = input && typeof input === 'object' ? input : {}

  return {
    authorName: normalizeString(source.authorName),
    repoUrl: normalizeString(source.repoUrl),
    avatar: normalizeString(source.avatar),
    applyAuthorToPublish: typeof source.applyAuthorToPublish === 'boolean'
      ? source.applyAuthorToPublish
      : false,
    followedPlugins: normalizeStringArray(source.followedPlugins),
  }
}

export async function loadDefaultAvatar(): Promise<string | null> {
  try {
    const cached = Storage.get<string>(DEFAULT_AVATAR_CACHE_KEY)
    if (cached) return cached
    const image = await UIImage.fromURL(DEFAULT_AVATAR_URL)
    const resized = image?.preparingThumbnail({ width: 128, height: 128 })
    const base64 = resized?.toJPEGBase64String(0.8)
    if (!base64) return null
    const dataUrl = `data:image/jpeg;base64,${base64}`
    Storage.set(DEFAULT_AVATAR_CACHE_KEY, dataUrl)
    return dataUrl
  } catch { return null }
}

const readUserSettings = (): UserSettings => {
  const saved = Storage.get<UserSettings>(STORAGE_KEY)
  const sanitized = sanitizeUserSettings(saved)
  return { ...defaultSettings, ...sanitized }
}

export const getUserSettings = (): UserSettings => {
  if (!cachedSettings) {
    cachedSettings = readUserSettings()
    followedPluginIds = new Set(cachedSettings.followedPlugins)
  }
  return cachedSettings
}

export const saveUserSettings = (settings: Partial<UserSettings>): UserSettings => {
  const updated = sanitizeUserSettings({ ...getUserSettings(), ...settings })
  cachedSettings = updated
  if (settings.followedPlugins !== undefined) {
    followedPluginIds = new Set(updated.followedPlugins)
  }
  Storage.set(STORAGE_KEY, updated)
  return updated
}

export const resetUserSettings = (): UserSettings => {
  cachedSettings = { ...defaultSettings, followedPlugins: [] }
  followedPluginIds = new Set()
  Storage.set(STORAGE_KEY, cachedSettings)
  notifyFavoriteChange()
  return cachedSettings
}

// --- Favorite change pub/sub ---------------------------------------
// 跨页面同步：用内存快照避免每个按钮渲染时重复读取 Storage；
// 仅将变更的插件 ID 通知给订阅者，未受影响的按钮不会重新渲染。
const favoriteListeners = new Set<FavoriteChangeListener>()
const pluginFavoriteListeners = new Map<string, Set<PluginFavoriteChangeListener>>()

export const subscribeFavoriteChange = (listener: FavoriteChangeListener): (() => void) => {
  favoriteListeners.add(listener)
  return () => { favoriteListeners.delete(listener) }
}

export const subscribePluginFavoriteChange = (
  pluginId: string,
  listener: PluginFavoriteChangeListener,
): (() => void) => {
  let listeners = pluginFavoriteListeners.get(pluginId)
  if (!listeners) {
    listeners = new Set()
    pluginFavoriteListeners.set(pluginId, listeners)
  }
  listeners.add(listener)

  return () => {
    listeners?.delete(listener)
    if (
      listeners?.size === 0 &&
      pluginFavoriteListeners.get(pluginId) === listeners
    ) {
      pluginFavoriteListeners.delete(pluginId)
    }
  }
}

const notifyFavoriteChange = (changedPluginId?: string, isFollowed?: boolean): void => {
  favoriteListeners.forEach(listener => { try { listener() } catch { /* ignore */ } })

  if (changedPluginId) {
    pluginFavoriteListeners.get(changedPluginId)?.forEach(listener => {
      try { listener(Boolean(isFollowed)) } catch { /* ignore */ }
    })
    return
  }

  // 资料重置会一次清空全部收藏；此低频路径需要同步所有当前可见按钮。
  pluginFavoriteListeners.forEach(listeners => {
    listeners.forEach(listener => { try { listener(false) } catch { /* ignore */ } })
  })
}

const togglePluginFollow = (id: string): UserSettings => {
  getUserSettings()
  const nextIds = new Set(followedPluginIds)
  if (nextIds.has(id)) nextIds.delete(id)
  else nextIds.add(id)
  const next = saveUserSettings({ followedPlugins: [...nextIds] })
  notifyFavoriteChange(id, followedPluginIds.has(id))
  return next
}

export const isFollowingPlugin = (pluginId: string): boolean => {
  getUserSettings()
  return followedPluginIds.has(pluginId)
}
export const toggleFollowPlugin = (pluginId: string) => togglePluginFollow(pluginId)
