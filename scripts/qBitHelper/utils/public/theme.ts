import { Color } from 'scripting';

/**
 * qBitHelper 赛博朋克主题 token（单一主题，强制霓虹风格）
 *
 * 所有 UI 无视系统明暗，全部走深底 + 霓虹色 + 等宽字体。
 * 顶层通过 `preferredColorScheme="dark"` 强制系统控件走深色皮肤。
 */

// —— 基础尺寸 ——
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const FontSize = {
  caption: 11,
  footnote: 13,
  body: 15,
  headline: 17,
  title: 22,
} as const;

export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

/** 全局字体族：SF Mono */
export const FontDesign = 'monospaced' as const;

// —— 赛博朋克调色板 ——
export const Neon = {
  // 容器
  bg:         '#07070F' as Color, // 最底层
  surface:    '#10101C' as Color, // List/Section row 底
  surfaceHi:  '#1A1A2E' as Color, // 卡片内高亮

  // 描边
  border:     'rgba(0,240,255,0.35)' as Color,
  borderHi:   'rgba(0,240,255,0.75)' as Color,

  // 主色
  cyan:       '#00F0FF' as Color, // 品牌 / 下载 / 链接
  magenta:    '#FF00A8' as Color, // 强调 / 上传 / 危险
  lime:       '#C6FF00' as Color, // 成功 / 活跃
  violet:     '#B580FF' as Color, // 种子
  amber:      '#FFB020' as Color, // 警告

  // 文本（深黑底下对比度充足）
  text:       '#F0F2FF' as Color, // 主文字，近白
  textDim:    '#A6A9C8' as Color, // 次文字，提亮一档
  textFade:   '#7A7EA0' as Color, // 脚注/占位，再提亮
} as const;

/**
 * 语义色：直接返回 `Color` 标量，可无缝用于 `foregroundStyle` / `background` / `tint`
 */
export const Colors = {
  // 品牌
  brand:    Neon.cyan,
  // 业务
  upload:   Neon.magenta,
  download: Neon.cyan,
  seed:     Neon.violet,
  active:   Neon.lime,
  // 状态
  success:  Neon.lime,
  danger:   Neon.magenta,
  warning:  Neon.amber,
  info:     Neon.cyan,
  neutral:  Neon.textDim,
  // 文字
  label:          Neon.text,
  secondaryLabel: Neon.textDim,
  tertiaryLabel:  Neon.textFade,
} as const;

// —— Widget 尺寸 & 发光 ——
export const WidgetMetrics = {
  padding: { small: 12, medium: 16, large: 16 },
  iconBar: 24,
  chartHeight: 80,
  neonGlow:       { radius: 4 }, // widget 端（性能保守）
  neonGlowStrong: { radius: 8 }, // 主页端
} as const;
