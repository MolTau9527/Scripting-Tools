// ============================================================
// iOS Design System Tokens
// 仅保留实际被引用的 token；历史冗余已移除。
// ============================================================

// 圆角：原生列表/表单之外，仅给业务卡片保留轻量层级。
export const cornerRadius = {
  md: 12,
  lg: 16,
} as const

// 间距
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const

// 字体大小（参考 iOS HIG）
export const fontSize = {
  caption2: 11,
  caption1: 12,
  footnote: 13,
  subheadline: 15,
  body: 17,
  title3: 20,
  largeTitle: 34,
} as const

// 辅助：生成水平/垂直对称的 padding
export const createSymmetricPadding = (vertical: number, horizontal: number) => ({
  top: vertical,
  bottom: vertical,
  leading: horizontal,
  trailing: horizontal,
})

// 深色模式玻璃染色：iOS 材质在深色下可能解析为浅色变体或带白色高光，
// 统一染上深空蓝确保行框不发白。浅色模式不染色，保留原生材质。
export const darkGlassTint = 'rgba(13,27,58,0.68)' as const
