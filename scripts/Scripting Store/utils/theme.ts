import { gradient } from 'scripting'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeColors = typeof lightColors | typeof darkColors

const THEME_STORAGE_KEY = 'scripting_store_theme'

const lightColors = {
  background: '#f9fafb', cardBackground: '#ffffff', inputBackground: '#f3f4f6',
  textPrimary: '#1f2937', textSecondary: '#6b7280', textTertiary: '#9ca3af',
  border: '#e5e7eb', buttonPrimary: '#007aff', buttonSuccess: '#10b981',
  buttonDanger: '#ef4444', buttonGray: '#6b7280',
} as const

const darkColors = {
  background: '#111827', cardBackground: '#1f2937', inputBackground: '#374151',
  textPrimary: '#ffffff', textSecondary: '#ffffff', textTertiary: '#ffffff',
  border: '#4b5563', buttonPrimary: '#60a5fa', buttonSuccess: '#34d399',
  buttonDanger: '#f87171', buttonGray: '#6b7280',
} as const

export const getActualThemeMode = (mode: ThemeMode): 'light' | 'dark' =>
  mode === 'system' ? (Device.colorScheme === 'dark' ? 'dark' : 'light') : mode

const isDark = (mode: ThemeMode) => getActualThemeMode(mode) === 'dark'

export const getThemeColors = (mode: ThemeMode): ThemeColors => isDark(mode) ? darkColors : lightColors

export const getSavedTheme = (): ThemeMode => Storage.get<ThemeMode>(THEME_STORAGE_KEY) || 'light'

export const saveTheme = (mode: ThemeMode) => Storage.set(THEME_STORAGE_KEY, mode)

export const getGradientBackground = (mode: ThemeMode) => gradient('linear', {
  colors: isDark(mode) ? ['#1f2937', '#111827', '#0f172a'] : ['#fdf2f8', '#fce7f3', '#fbcfe8'],
  startPoint: 'top', endPoint: 'bottom'
})

export const getHeaderGradient = (mode: ThemeMode) => gradient('linear', {
  colors: isDark(mode) ? ['#1e3a5f', '#1e293b'] : ['#1e3a5f', '#2d5a87'],
  startPoint: 'topLeading', endPoint: 'bottomTrailing'
})
