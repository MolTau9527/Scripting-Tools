/**
 * iPaTool 设计系统 - 设计令牌
 *
 * 定义应用中使用的字体、颜色、间距等设计约定
 * 在开发时直接使用这些约定，确保界面一致性
 */

// 字体使用约定
export const FontStyles = {
  // 页面主标题
  pageTitle: {
    font: "title" as const,
    fontWeight: "bold" as const,
  },

  // 章节标题
  sectionTitle: {
    font: "headline" as const,
    fontWeight: "semibold" as const,
  },

  // 应用名称 - 用于应用列表中的应用名称显示
  appName: {
    font: "body" as const,
    fontWeight: "semibold" as const,
  },

  // 正文内容
  body: {
    font: "body" as const,
    fontWeight: "regular" as const,
  },

  // 说明文字
  caption: {
    font: "footnote" as const,
    fontWeight: "regular" as const,
  },

  // 按钮文字
  button: {
    font: "body" as const,
    fontWeight: "medium" as const,
  },
} as const;

// 颜色使用约定 - 支持自动主题切换
export const Colors = {
  // 文本颜色 - 动态适应明暗主题
  text: {
    primary: {
      light: "black",
      dark: "white",
    }, // 主要文本
    secondary: {
      light: "gray",
      dark: "lightGray",
    }, // 次要文本
    tertiary: {
      light: "lightGray",
      dark: "gray",
    }, // 辅助文本
  },

  // 状态颜色 - 在不同主题下保持良好可读性
  status: {
    success: {
      light: "systemGreen",
      dark: "systemPurple",
    }, // 成功状态
    error: {
      light: "systemRed",
      dark: "systemRed",
    }, // 错误状态
    warning: {
      light: "systemOrange",
      dark: "systemOrange",
    }, // 警告状态
    info: {
      light: "systemBlue",
      dark: "systemBlue",
    }, // 信息状态
  },

  // 背景颜色 - 使用系统原生背景色，自动适应主题
  background: {
    primary: "systemBackground" as const,
    secondary: "secondarySystemBackground" as const,
    tertiary: "tertiarySystemBackground" as const,
    selected: {
      light: "secondarySystemFill",
      dark: "rgba(235, 235, 240, 0.3)",
    } as const,
  },

  // 边框颜色 - 动态适应明暗主题
  border: {
    primary: {
      light: "systemGray4",
      dark: "systemGray2",
    }, // 主要边框
    secondary: {
      light: "systemGray5",
      dark: "systemGray3",
    }, // 次要边框
    tertiary: {
      light: "systemGray6",
      dark: "systemGray4",
    }, // 辅助边框
    accent: {
      light: "systemBlue",
      dark: "systemBlue",
    }, // 强调边框
    selected: {
      light: "systemBlue",
      dark: "systemBlue",
    }, // 选中状态边框
  },

  // 阴影颜色 - 使用系统颜色
  shadow: {
    primary: "systemGray" as const, // 主要阴影
    secondary: "systemGray2" as const, // 次要阴影
    strong: "systemGray6" as const, // 强阴影
  },

  //按钮颜色
  button: {
    blue: "systemBlue",
    red: "systemRed",
    gray: "systemGray2",
  },
} as const;

// 间距使用约定
export const Spacing = {
  xxs: 2, // 超小间距 - 用于紧密排列的元素
  xs: 4, // 极小间距
  sm: 8, // 小间距
  md: 16, // 中等间距
  lg: 24, // 大间距
  xl: 32, // 超大间距
} as const;

// 圆角使用约定
export const BorderRadius = {
  sm: 4, // 小圆角
  md: 8, // 中等圆角
  lg: 12, // 大圆角
  xl: 16, // 超大圆角
  xxl: 20, // 2倍大圆角
  xxxl: 24, // 3倍大圆角
} as const;

// 边框宽度使用约定
export const BorderWidth = {
  thin: 0.5, // 细边框
  regular: 1, // 常规边框
  thick: 2, // 粗边框
  bold: 3, // 加粗边框
} as const;

// 阴影配置使用约定
export const Shadow = {
  // 阴影半径
  radius: {
    sm: 2, // 小阴影
    md: 4, // 中等阴影
    lg: 8, // 大阴影
    xl: 12, // 超大阴影
  },
  // 阴影偏移
  offset: {
    sm: { x: 0, y: 1 }, // 小偏移
    md: { x: 0, y: 2 }, // 中等偏移
    lg: { x: 0, y: 4 }, // 大偏移
    xl: { x: 0, y: 6 }, // 超大偏移
  },
} as const;

// 背景样式约定（组件统一使用）
export const BackgroundStyles = {
  // 强调型背景（用于主操作按钮等），采用系统蓝色并启用渐变以匹配下载主图标的视觉氛围
  accentPrimary: {
    color: Colors.status.info.light, // 使用系统蓝色，保证明暗主题一致性
    gradient: true as const, // 启用系统渐变效果
  },

  // 次要背景（卡片等）
  card: {
    color: Colors.background.secondary,
  },

  // 纯色背景（基础容器）
  base: {
    color: Colors.background.primary,
  },
} as const;

// 阴影组合约定（将阴影半径与偏移组合为易用的预设）
export const Shadows = {
  // 轻微阴影：用于图标、按钮等轻量层次的提升
  subtle: {
    color: Colors.shadow.primary,
    radius: Shadow.radius.sm,
    x: Shadow.offset.sm.x,
    y: Shadow.offset.sm.y,
  },

  // 中等阴影：用于主操作按钮或卡片的强调
  medium: {
    color: Colors.shadow.primary,
    radius: Shadow.radius.md,
    x: Shadow.offset.md.x,
    y: Shadow.offset.md.y,
  },

  // 强阴影：用于悬浮层等强层次需求
  strong: {
    color: Colors.shadow.secondary,
    radius: Shadow.radius.lg,
    x: Shadow.offset.lg.x,
    y: Shadow.offset.lg.y,
  },
} as const;

/**
 * 使用示例：
 *
 * // 页面标题
 * <Text
 *   {...FontStyles.pageTitle}
 *   foregroundStyle={Colors.text.primary}
 * >
 *   标题文本
 * </Text>
 *
 * // 成功状态文本
 * <Text
 *   {...FontStyles.body}
 *   foregroundStyle={Colors.status.success}
 * >
 *   操作成功
 * </Text>
 *
 * // 带间距的容器
 * <VStack spacing={Spacing.md}>
 *   <Text>内容</Text>
 * </VStack>
 *
 * // 带边框和阴影的圆角矩形
 * <RoundedRectangle
 *   fill={Colors.background.tertiary}
 *   cornerRadius={BorderRadius.xl}
 *   stroke={{
 *     shapeStyle: Colors.border.primary,
 *     strokeStyle: {
 *       lineWidth: BorderWidth.regular
 *     }
 *   }}
 *   shadow={{
 *     color: Colors.shadow.primary,
 *     radius: Shadow.radius.md,
 *     x: Shadow.offset.md.x,
 *     y: Shadow.offset.md.y,
 *   }}
 * />
 */
