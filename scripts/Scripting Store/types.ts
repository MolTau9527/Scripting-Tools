/**
 * 插件数据类型定义
 */

// 插件信息
export interface Plugin {
  id: number
  name: string
  description: string
  icon: string // emoji 或 base64 图片
  author: string
  url: string
  updateTime: string
  installCount?: number
}

// API 响应格式
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 网站配置
export interface SiteConfig {
  bannerTitle: string
  bannerSubtitle: string
}

// 排序类型
export type SortType = 'time' | 'popular'

// 加载状态
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 发布插件数据
export interface SubmitPluginData {
  name: string
  description: string
  icon: string
  author: string
  url: string
}

// 用户设置
export interface UserSettings {
  authorName: string
  repoUrl: string
  avatar: string // base64 或 URL
  applyAuthorToPublish: boolean
}
