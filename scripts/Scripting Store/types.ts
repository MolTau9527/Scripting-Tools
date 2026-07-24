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

export interface SiteConfig {
  bannerTitle: string
  bannerSubtitle: string
}

export type SortType = 'time' | 'popular'

export interface SubmitPluginData {
  name: string
  description: string
  icon: string
  symbol?: string
  author: string
  url: string
}

export interface UserSettings {
  authorName: string
  repoUrl: string
  avatar: string
  applyAuthorToPublish: boolean
  followedPlugins: string[]
}
