import { Button, HStack, Navigation, ScrollView, Spacer, Text, VStack } from 'scripting'
import { type ThemeMode, getThemeColors, getActualThemeMode, getGradientBackground } from '../utils/theme'

interface ChangelogProps {
  themeMode: ThemeMode
}

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2025-12-11',
    changes: [
      '发布Scripting Store插件',
    ]
  },
  {
    version: '1.0.1',
    date: '2025-12-12',
    changes: [
      '更新支持深色模式',
    ]
  },
  {
    version: '1.0.2',
    date: '2025-12-16',
    changes: [
      '更新图标为SVG',
    ]
  },
  {
    version: '1.0.3',
    date: '2025-12-17',
    changes: [
      '支持 SF Symbol显示',
    ]
  }
]

export const Changelog = ({ themeMode }: ChangelogProps) => {
  const dismiss = Navigation.useDismiss()
  const actualTheme = getActualThemeMode(themeMode)
  const colors = getThemeColors(themeMode)
  const gradientBg = getGradientBackground(themeMode)

  return (
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background={gradientBg} preferredColorScheme={actualTheme}>
      <HStack padding={16} background={colors.cardBackground} alignment="center">
        <Button action={() => dismiss()}>
          <Text font={16} foregroundStyle={colors.buttonPrimary}>返回</Text>
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold" foregroundStyle={colors.textPrimary}>更新日志</Text>
        <Spacer />
        <VStack frame={{ width: 50 }} />
      </HStack>

      <ScrollView>
        <VStack padding={16} spacing={16}>
          {[...changelog].reverse().map((entry, index) => (
            <VStack key={index} padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} spacing={12} alignment="leading">
              <HStack alignment="center" spacing={8}>
                <Text font={18} fontWeight="bold" foregroundStyle={colors.buttonPrimary}>v{entry.version}</Text>
                <Text font={13} foregroundStyle={colors.textTertiary}>{entry.date}</Text>
              </HStack>
              <VStack spacing={8} alignment="leading">
                {entry.changes.map((change, changeIndex) => (
                  <HStack key={changeIndex} spacing={8} alignment="top">
                    <Text font={14} foregroundStyle={colors.buttonSuccess}>•</Text>
                    <Text font={14} foregroundStyle={colors.textSecondary} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>{change}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  )
}
