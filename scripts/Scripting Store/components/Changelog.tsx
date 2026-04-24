import { HStack, Navigation, Text, ScrollView, VStack } from 'scripting'
import { useTheme } from '../contexts/ThemeContext'
import { spacing, fontSize } from '../utils/styles'
import { ContentCard } from './common/ContentCard'
import { NavigationAction } from './common/NavigationAction'
import { PageHeader } from './common/PageHeader'

// ============================================================
// Types
// ============================================================

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

// 按版本从旧到新维护；渲染时从末尾向前遍历，避免每次渲染 `.reverse()` 复制数组。
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
  },
  {
    version: '2.0.0',
    date: '2026-01-30',
    changes: [
      '新增最新区',
    ]
  },
  {
    version: '2.0.1',
    date: '2026-04-23',
    changes: [
      '优化一些BUG',
    ]
  }
]

// 渲染时使用新→旧顺序；预计算避免每次渲染复制。
const changelogNewestFirst: ChangelogEntry[] = [...changelog].reverse()

// ============================================================
// Component
// ============================================================

export const Changelog = () => {
  const dismiss = Navigation.useDismiss()
  const { actualMode, colors } = useTheme()

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      background={colors.secondaryBackground}
      preferredColorScheme={actualMode}
    >
      <PageHeader
        title="更新日志"
        leading={<NavigationAction type="back" onPress={() => dismiss()} />}
      />

      <ScrollView>
        <VStack padding={spacing.lg} spacing={spacing.lg}>
          {changelogNewestFirst.map((entry) => (
            <ContentCard
              key={`${entry.version}-${entry.date}`}
              alignment="leading"
            >
              <HStack alignment="center" spacing={spacing.sm}>
                <Text font={fontSize.title3} fontWeight="bold" foregroundStyle={colors.tint}>
                  v{entry.version}
                </Text>
                <Text font={fontSize.footnote} foregroundStyle={colors.tertiaryLabel}>
                  {entry.date}
                </Text>
              </HStack>
              <VStack spacing={spacing.sm} alignment="leading">
                {entry.changes.map((change) => (
                  <HStack key={`${entry.version}-${change}`} spacing={spacing.sm} alignment="top">
                    <Text font={fontSize.subheadline} foregroundStyle={colors.systemGreen}>•</Text>
                    <Text
                      font={fontSize.subheadline}
                      foregroundStyle={colors.secondaryLabel}
                      frame={{ maxWidth: 'infinity', alignment: 'leading' }}
                    >
                      {change}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </ContentCard>
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  )
}
