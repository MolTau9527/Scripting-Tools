/**
 * 用户设置存储工具
 */

import type { UserSettings } from '../types'

const STORAGE_KEY = 'scripting_store_user_settings'
const DEFAULT_AVATAR_CACHE_KEY = 'scripting_store_default_avatar_cache'

// 默认头像 URL
const DEFAULT_AVATAR_URL = 'https://tjupt.org/bitbucket/160422546887fec40c92246fd1aa5912.png'

// 默认设置
const defaultSettings: UserSettings = {
  authorName: '',
  repoUrl: '',
  avatar: '',
  applyAuthorToPublish: false
}

/**
 * 下载并缓存默认头像
 */
export async function loadDefaultAvatar(): Promise<string | null> {
  try {
    // 检查缓存
    const cached = Storage.get<string>(DEFAULT_AVATAR_CACHE_KEY)
    if (cached) {
      return cached
    }

    // 下载图片
    const image = await UIImage.fromURL(DEFAULT_AVATAR_URL)
    if (!image) {
      return null
    }

    // 缩放并转为 base64
    const resized = image.preparingThumbnail({ width: 128, height: 128 })
    if (!resized) {
      return null
    }

    const base64 = resized.toJPEGBase64String(0.8)
    if (base64) {
      const dataUrl = `data:image/jpeg;base64,${base64}`
      Storage.set(DEFAULT_AVATAR_CACHE_KEY, dataUrl)
      return dataUrl
    }

    return null
  } catch {
    return null
  }
}

/**
 * 获取用户设置
 */
export function getUserSettings(): UserSettings {
  try {
    const saved = Storage.get<UserSettings>(STORAGE_KEY)
    return saved ? { ...defaultSettings, ...saved } : defaultSettings
  } catch {
    return defaultSettings
  }
}

/**
 * 保存用户设置
 */
export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getUserSettings()
  const updated = { ...current, ...settings }
  Storage.set(STORAGE_KEY, updated)
  return updated
}

/**
 * 重置用户设置
 */
export function resetUserSettings(): UserSettings {
  Storage.set(STORAGE_KEY, defaultSettings)
  return defaultSettings
}
