/**
 * 少女粉二次元主题色板
 * 所有颜色均支持 light / dark 双模式，直接用于 foregroundStyle / background 等
 * 需要 DynamicShapeStyle 的字段（形如 { light, dark }）
 */

import type { Color } from "scripting";

/** 主色：亮色下鲜粉，暗色下柔和一档以避免刺眼 */
export const primary: { light: Color; dark: Color } = {
  light: "#FF6B9D",
  dark: "#FF8FB5",
};

/** 浅粉：用于渐变起始、边线点缀 */
export const primaryLight: { light: Color; dark: Color } = {
  light: "#FFB6D9",
  dark: "#FFA6CE",
};

/** Banner 渐变结束色（比 primary 再深一点） */
export const primaryDeep: { light: Color; dark: Color } = {
  light: "#FF4F89",
  dark: "#FF6F9F",
};

/** Icon 胶囊色（与 SF Symbol 图标语义保持一致的粉色系调色板） */
export const iconRose: { light: Color; dark: Color } = {
  light: "#FF7AA8",
  dark: "#FF9CC0",
};
export const iconPeach: { light: Color; dark: Color } = {
  light: "#FFA17A",
  dark: "#FFB599",
};
export const iconCoral: { light: Color; dark: Color } = {
  light: "#FF6B8A",
  dark: "#FF8CA5",
};
export const iconLilac: { light: Color; dark: Color } = {
  light: "#C9A0FF",
  dark: "#D4B3FF",
};
export const iconMauve: { light: Color; dark: Color } = {
  light: "#E08BBF",
  dark: "#EBA5CC",
};
export const iconMint: { light: Color; dark: Color } = {
  light: "#7ED6C1",
  dark: "#95DFCE",
};

/** 页面整体背景：亮色近白带粉调，暗色深灰近黑 */
export const bgPage: { light: Color; dark: Color } = {
  light: "#FFF5F8",
  dark: "#1A1416",
};

/** 卡片背景：亮色纯白，暗色深灰 */
export const bgCard: { light: Color; dark: Color } = {
  light: "#FFFFFF",
  dark: "#2A2326",
};

/** 主文字色 */
export const textPrimary: { light: Color; dark: Color } = {
  light: "#1F1B1D",
  dark: "#F5EEF1",
};

/** 次要文字色 */
export const textSecondary: { light: Color; dark: Color } = {
  light: "#8A7E84",
  dark: "#A89EA3",
};

/** 分隔线 */
export const divider: { light: Color; dark: Color } = {
  light: "#FFE4EE",
  dark: "#3A2F33",
};

/** 卡片阴影色 */
export const shadow: { light: Color; dark: Color } = {
  light: "rgba(255,107,157,0.18)",
  dark: "rgba(0,0,0,0.5)",
};

/** 错误 / 警示色 */
export const danger: { light: Color; dark: Color } = {
  light: "#FF3B6F",
  dark: "#FF6F97",
};
