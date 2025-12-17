export interface Plugin {
  id: number
  name: string
  description: string
  icon: string
  symbol?: string
  author: string
  url: string
  updateTime: string
  installCount?: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface SiteConfig {
  bannerTitle: string
  bannerSubtitle: string
}

export type SortType = 'time' | 'popular'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface SubmitPluginData {
  name: string
  description: string
  icon: string
  author: string
  url: string
}

export interface UserSettings {
  authorName: string
  repoUrl: string
  avatar: string
  applyAuthorToPublish: boolean
  followedAuthors: string[]
  followedPlugins: string[]
}
