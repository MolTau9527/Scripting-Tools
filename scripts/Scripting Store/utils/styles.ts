import { gradient } from 'scripting'

// ============================================================
// iOS Design System Tokens
// 仅保留实际被引用的 token；历史冗余已移除。
// ============================================================

// 圆角
export const cornerRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const

// 间距
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

// 字体大小（参考 iOS HIG）
export const fontSize = {
  caption2: 11,
  caption1: 12,
  footnote: 13,
  subheadline: 15,
  callout: 16,
  body: 17,
  headline: 17,
  title3: 20,
  title2: 22,
  title1: 28,
  largeTitle: 34,
} as const

// 图标尺寸
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  featured: 80,
} as const

// 辅助：生成水平/垂直对称的 padding
export const createSymmetricPadding = (vertical: number, horizontal: number) => ({
  top: vertical,
  bottom: vertical,
  leading: horizontal,
  trailing: horizontal,
})

// 渐变背景（根据浅色/深色模式）
export const getGradientBackground = (mode: 'light' | 'dark') =>
  mode === 'dark'
    ? gradient('linear', {
        colors: ['#04111f', '#0d2f52', '#1b5e91'],
        startPoint: 'top',
        endPoint: 'bottom',
      })
    : gradient('linear', {
        colors: ['#e8f7ff', '#b8e6ff', '#7ccfff'],
        startPoint: 'topLeading',
        endPoint: 'bottomTrailing',
      })
