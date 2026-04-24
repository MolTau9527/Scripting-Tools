import type { UserSettings } from '../types'

const STORAGE_KEY = 'scripting_store_user_settings'
const DEFAULT_AVATAR_CACHE_KEY = 'scripting_store_default_avatar_cache'
const DEFAULT_AVATAR_URL = 'https://tjupt.org/bitbucket/160422546887fec40c92246fd1aa5912.png'

const defaultSettings: UserSettings = {
  authorName: '', repoUrl: '', avatar: '', applyAuthorToPublish: false,
  followedPlugins: []
}

type UserSettingsInput = Partial<UserSettings> | null | undefined

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

export const getUserSettings = (): UserSettings => {
  const saved = Storage.get<UserSettings>(STORAGE_KEY)
  const sanitized = sanitizeUserSettings(saved)
  return { ...defaultSettings, ...sanitized }
}

export const saveUserSettings = (settings: Partial<UserSettings>): UserSettings => {
  const updated = sanitizeUserSettings({ ...getUserSettings(), ...settings })
  Storage.set(STORAGE_KEY, updated)
  return updated
}

export const resetUserSettings = (): UserSettings => {
  Storage.set(STORAGE_KEY, defaultSettings)
  return defaultSettings
}

// --- Favorite change pub/sub ---------------------------------------
// 跨页面同步：在任意位置调用 toggleFollowPlugin 后，所有订阅者会被通知。
const favoriteListeners = new Set<() => void>()

export const subscribeFavoriteChange = (listener: () => void): (() => void) => {
  favoriteListeners.add(listener)
  return () => { favoriteListeners.delete(listener) }
}

const notifyFavoriteChange = (): void => {
  favoriteListeners.forEach(l => { try { l() } catch { /* ignore */ } })
}

const togglePluginFollow = (id: string): UserSettings => {
  const list = [...(getUserSettings().followedPlugins || [])]
  const idx = list.indexOf(id)
  if (idx === -1) list.push(id)
  else list.splice(idx, 1)
  const next = saveUserSettings({ followedPlugins: list })
  notifyFavoriteChange()
  return next
}

export const isFollowingPlugin = (pluginId: string) => (getUserSettings().followedPlugins || []).includes(pluginId)
export const toggleFollowPlugin = (pluginId: string) => togglePluginFollow(pluginId)
