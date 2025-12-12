import type { UserSettings } from '../types'

const STORAGE_KEY = 'scripting_store_user_settings'
const DEFAULT_AVATAR_CACHE_KEY = 'scripting_store_default_avatar_cache'
const DEFAULT_AVATAR_URL = 'https://tjupt.org/bitbucket/160422546887fec40c92246fd1aa5912.png'

const defaultSettings: UserSettings = {
  authorName: '', repoUrl: '', avatar: '', applyAuthorToPublish: false,
  followedAuthors: [], followedPlugins: []
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
  return saved ? { ...defaultSettings, ...saved } : defaultSettings
}

export const saveUserSettings = (settings: Partial<UserSettings>): UserSettings => {
  const updated = { ...getUserSettings(), ...settings }
  Storage.set(STORAGE_KEY, updated)
  return updated
}

export const resetUserSettings = (): UserSettings => {
  Storage.set(STORAGE_KEY, defaultSettings)
  return defaultSettings
}

const toggleList = <K extends 'followedAuthors' | 'followedPlugins'>(key: K, id: string): UserSettings => {
  const list = [...(getUserSettings()[key] || [])]
  const idx = list.indexOf(id)
  idx === -1 ? list.push(id) : list.splice(idx, 1)
  return saveUserSettings({ [key]: list })
}

export const isFollowingAuthor = (author: string) => getUserSettings().followedAuthors.includes(author)
export const toggleFollowAuthor = (author: string) => toggleList('followedAuthors', author)
export const isFollowingPlugin = (pluginId: string) => (getUserSettings().followedPlugins || []).includes(pluginId)
export const toggleFollowPlugin = (pluginId: string) => toggleList('followedPlugins', pluginId)
