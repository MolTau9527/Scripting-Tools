import { ZStack, createContext, useContext, useMemo, useCallback, useState, useColorScheme, useSelector } from 'scripting'
import type { Color } from 'scripting'

// ============================================================
// Types
// ============================================================

type ThemeMode = 'light' | 'dark' | 'system'

// 浅色配色系列：星空蓝 / 樱花粉 / 木质调（深色固定为深空星夜蓝）
export type LightTheme = 'starry' | 'sakura' | 'wood'

// 使用 Scripting 的 Color 字面量联合类型（hex / rgba / keyword），
// 让 colors.* 可以直接传给 foregroundStyle / background 等 ShapeStyle 属性。
type ColorValue = Color

export interface SemanticColors {
  background: ColorValue
  secondaryBackground: ColorValue
  label: ColorValue
  secondaryLabel: ColorValue
  tertiaryLabel: ColorValue
  tint: ColorValue
  tertiaryFill: ColorValue
  glassWash: ColorValue
  systemRed: ColorValue
}

interface ThemeContextValue {
  mode: ThemeMode
  actualMode: 'light' | 'dark'
  lightTheme: LightTheme
  colors: SemanticColors
  setMode: (mode: ThemeMode) => void
  setLightTheme: (theme: LightTheme) => void
}

// ============================================================
// Branded light / dark palettes
// ============================================================

// 浅色·星空蓝：晨空蓝页面底色，与星空蓝背景层同一色相，避免退化为纯白设置页。
const starryLightColors: SemanticColors = {
  background: '#EFF4FC',
  secondaryBackground: '#FFFFFF',
  label: '#0E2145',
  secondaryLabel: '#3D5680',
  tertiaryLabel: '#5B7195',
  tint: '#2563EB',
  tertiaryFill: '#B6CCE9',
  glassWash: 'rgba(37,99,235,0.08)',
  systemRed: '#C24141',
}

// 浅色·樱花粉：晨樱粉底色，深梅紫文字保证对比度。
const sakuraLightColors: SemanticColors = {
  background: '#FBF1F5',
  secondaryBackground: '#FFFFFF',
  label: '#4A1A31',
  secondaryLabel: '#7C4059',
  tertiaryLabel: '#9C6480',
  tint: '#D6336C',
  tertiaryFill: '#E9BACD',
  glassWash: 'rgba(214,51,108,0.07)',
  systemRed: '#C0304A',
}

// 浅色·木质调：暖纸浆底色 + 胡桃木强调，深咖啡文字。
const woodLightColors: SemanticColors = {
  background: '#F8F1E7',
  secondaryBackground: '#FFFFFF',
  label: '#3E2B18',
  secondaryLabel: '#6B5138',
  tertiaryLabel: '#8A6B4B',
  tint: '#8C5A2B',
  tertiaryFill: '#DCC49E',
  glassWash: 'rgba(140,90,43,0.08)',
  systemRed: '#B0483C',
}

const lightPalettes: Record<LightTheme, SemanticColors> = {
  starry: starryLightColors,
  sakura: sakuraLightColors,
  wood: woodLightColors,
}

// 深色显式指定深空星夜蓝与高对比文字，不再依赖运行时解析系统语义色。
// tint 采用 Apple 深色系统蓝 #0A84FF：既保证 glassProminent 按钮白字可读，
// 也保证作为强调文字压深蓝玻璃时达到大字号对比标准。
const darkColors: SemanticColors = {
  background: '#040B1E',
  secondaryBackground: '#0C1830',
  label: '#F2F7FF',
  secondaryLabel: '#C9D8EE',
  tertiaryLabel: '#A6BBDA',
  tint: '#0A84FF',
  tertiaryFill: '#274476',
  glassWash: 'rgba(96,165,250,0.16)',
  systemRed: '#FF7B7B',
}

// ============================================================
// Storage
// ============================================================

const THEME_STORAGE_KEY = 'scripting_store_theme'
const LIGHT_THEME_STORAGE_KEY = 'scripting_store_light_theme'

const getSavedTheme = (): ThemeMode => {
  const savedMode = Storage.get<ThemeMode>(THEME_STORAGE_KEY)
  return savedMode === 'light' || savedMode === 'dark' || savedMode === 'system'
    ? savedMode
    : 'system'
}

const saveTheme = (mode: ThemeMode) => {
  Storage.set(THEME_STORAGE_KEY, mode)
}

const getSavedLightTheme = (): LightTheme => {
  const saved = Storage.get<LightTheme>(LIGHT_THEME_STORAGE_KEY)
  return saved === 'starry' || saved === 'sakura' || saved === 'wood' ? saved : 'starry'
}

const saveLightTheme = (theme: LightTheme) => {
  Storage.set(LIGHT_THEME_STORAGE_KEY, theme)
}

// ============================================================
// Context
// ============================================================

const ThemeContext = createContext<ThemeContextValue>()

export const ThemeProvider = ({ children }: { children: JSX.Element }) => {
  const [mode, setModeState] = useState<ThemeMode>(getSavedTheme)
  const [lightTheme, setLightThemeState] = useState<LightTheme>(getSavedLightTheme)
  const systemMode = useColorScheme()

  // actualMode 和 colors 是纯计算派生值，不需要 useMemo 包裹
  const actualMode = mode === 'system' ? systemMode : mode
  const colors = actualMode === 'dark' ? darkColors : lightPalettes[lightTheme]

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    saveTheme(newMode)
  }, [])

  const setLightTheme = useCallback((newTheme: LightTheme) => {
    setLightThemeState(newTheme)
    saveLightTheme(newTheme)
  }, [])

  const value = useMemo(() => ({
    mode,
    actualMode,
    lightTheme,
    colors,
    setMode,
    setLightTheme,
  }), [mode, actualMode, lightTheme, colors, setMode, setLightTheme])

  return (
    <ThemeContext.Provider value={value}>
      {/* 星空背景不放在这里：NavigationStack 自带不透明底色会盖住兄弟层。
          各页面通过 List/Form 的 background 属性挂 GlassBackground。 */}
      <ZStack
        frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
        preferredColorScheme={actualMode}
        foregroundStyle={colors.label}
        tint={colors.tint}
      >
        {children}
      </ZStack>
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
  return useSelector(ThemeContext, value => value.colors)
}

export const useActualMode = (): 'light' | 'dark' => {
  return useSelector(ThemeContext, value => value.actualMode)
}

export const useLightTheme = (): LightTheme => {
  return useSelector(ThemeContext, value => value.lightTheme)
}

// 获取主题图标名称
export const getThemeIcon = (mode: ThemeMode): string => {
  switch (mode) {
    case 'light': return 'sun.max.fill'
    case 'dark': return 'moon.stars.fill'
    case 'system': return 'circle.lefthalf.filled'
  }
}

// 浅色配色系列的菜单元数据
export const lightThemeOptions: ReadonlyArray<{ value: LightTheme; label: string; icon: string }> = [
  { value: 'starry', label: '星空蓝', icon: 'sparkles' },
  { value: 'sakura', label: '樱花粉', icon: 'camera.macro' },
  { value: 'wood', label: '木质调', icon: 'tree.fill' },
]
