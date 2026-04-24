import { createContext, useContext, useState, useMemo, useCallback } from 'scripting'
import type { Color } from 'scripting'

// ============================================================
// Types
// ============================================================

export type ThemeMode = 'light' | 'dark' | 'system'

// 使用 Scripting 的 Color 字面量联合类型（hex / rgba / keyword），
// 让 colors.* 可以直接传给 foregroundStyle / background 等 ShapeStyle 属性。
type ColorValue = Color

export interface SemanticColors {
  // 背景
  background: ColorValue
  secondaryBackground: ColorValue
  tertiaryBackground: ColorValue
  groupedBackground: ColorValue

  // 文字
  label: ColorValue
  secondaryLabel: ColorValue
  tertiaryLabel: ColorValue
  quaternaryLabel: ColorValue

  // 交互
  tint: ColorValue
  separator: ColorValue
  opaqueSeparator: ColorValue

  // 填充
  fill: ColorValue
  secondaryFill: ColorValue
  tertiaryFill: ColorValue

  // 系统色
  systemRed: ColorValue
  systemGreen: ColorValue
  systemBlue: ColorValue
  systemOrange: ColorValue
  systemYellow: ColorValue
  systemGray: ColorValue
}

export interface ThemeContextValue {
  mode: ThemeMode
  actualMode: 'light' | 'dark'
  colors: SemanticColors
  setMode: (mode: ThemeMode) => void
}

// ============================================================
// Color Definitions
// ============================================================

const lightColors: SemanticColors = {
  // 背景 - 渐变天空蓝玻璃效果
  background: 'rgba(240,248,255,0.92)',
  secondaryBackground: 'rgba(255,255,255,0.72)',
  tertiaryBackground: 'rgba(230,244,255,0.78)',
  groupedBackground: '#eaf6ff',

  // 文字
  label: '#0f2d4a',
  secondaryLabel: '#4e7ca1',
  tertiaryLabel: '#7fa6c3',
  quaternaryLabel: '#a8c4d9',

  // 交互 - 天空蓝
  tint: '#2f9bff',
  separator: 'rgba(69,126,171,0.16)',
  opaqueSeparator: '#c8e0f1',

  // 填充
  fill: 'rgba(83,166,235,0.18)',
  secondaryFill: 'rgba(116,191,245,0.14)',
  tertiaryFill: 'rgba(255,255,255,0.42)',

  // 系统色
  systemRed: '#ff3b30',
  systemGreen: '#34c759',
  systemBlue: '#2f9bff',
  systemOrange: '#ff9500',
  systemYellow: '#ffcc00',
  systemGray: '#8e8e93',
}

const darkColors: SemanticColors = {
  // 背景 - 夜空蓝
  background: 'rgba(8,24,43,0.96)',
  secondaryBackground: 'rgba(13,37,64,0.82)',
  tertiaryBackground: 'rgba(19,47,79,0.86)',
  groupedBackground: '#071a2f',

  // 文字
  label: '#f4fbff',
  secondaryLabel: 'rgba(196,226,246,0.82)',
  tertiaryLabel: 'rgba(164,203,230,0.76)',
  quaternaryLabel: 'rgba(140,181,209,0.56)',

  // 交互 - 高亮天蓝
  tint: '#6bc5ff',
  separator: 'rgba(107,197,255,0.22)',
  opaqueSeparator: '#1f4f78',

  // 填充
  fill: 'rgba(77,156,214,0.32)',
  secondaryFill: 'rgba(63,128,181,0.28)',
  tertiaryFill: 'rgba(255,255,255,0.12)',

  // 系统色
  systemRed: '#ff453a',
  systemGreen: '#30d158',
  systemBlue: '#6bc5ff',
  systemOrange: '#ff9f0a',
  systemYellow: '#ffd60a',
  systemGray: '#8e8e93',
}

// ============================================================
// Storage
// ============================================================

const THEME_STORAGE_KEY = 'scripting_store_theme'

const getSavedTheme = (): ThemeMode => {
  return Storage.get<ThemeMode>(THEME_STORAGE_KEY) || 'system'
}

const saveTheme = (mode: ThemeMode) => {
  Storage.set(THEME_STORAGE_KEY, mode)
}

// ============================================================
// Context
// ============================================================

const ThemeContext = createContext<ThemeContextValue>()

export const ThemeProvider = ({ children }: { children: JSX.Element }) => {
  const [mode, setModeState] = useState<ThemeMode>(getSavedTheme())

  const actualMode = useMemo(() => {
    if (mode === 'system') {
      return Device.colorScheme === 'dark' ? 'dark' : 'light'
    }
    return mode
  }, [mode])

  const colors = useMemo(() => {
    return actualMode === 'dark' ? darkColors : lightColors
  }, [actualMode])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    saveTheme(newMode)
  }, [])

  const value = useMemo(() => ({
    mode,
    actualMode,
    colors,
    setMode,
  }), [mode, actualMode, colors, setMode])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================
// Hook
// ============================================================

export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext)
}

// 便捷 hook：仅获取颜色
export const useColors = (): SemanticColors => {
  return useTheme().colors
}

// 便捷 hook：切换主题
export const useToggleTheme = () => {
  const { mode, setMode } = useTheme()

  return useCallback(() => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const nextIndex = (modes.indexOf(mode) + 1) % modes.length
    setMode(modes[nextIndex])
  }, [mode, setMode])
}

// 获取主题图标名称
export const getThemeIcon = (mode: ThemeMode): string => {
  switch (mode) {
    case 'light': return 'sun.max.fill'
    case 'dark': return 'moon.fill'
    case 'system': return 'circle.lefthalf.filled'
  }
}

// 获取主题显示名称
export const getThemeLabel = (mode: ThemeMode): string => {
  switch (mode) {
    case 'light': return '浅色'
    case 'dark': return '深色'
    case 'system': return '跟随系统'
  }
}
