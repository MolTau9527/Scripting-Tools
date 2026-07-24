import { Button, HStack, List, Navigation, NavigationStack, Section, Text } from 'scripting'
import { useTheme } from '../contexts/ThemeContext'
import { ThemeRowBackground } from './common/ThemeRowBackground'
import { GlassBackground } from './common/GlassBackground'
import { spacing, fontSize } from '../utils/styles'

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
    date: '2025-01-01',
    changes: [
      '端上来了',
    ],
  },
  {
    version: '1.0.1',
    date: '2025-01-05',
    changes: [
      '下锅煮螺蛳粉',
    ],
  },
  {
    version: '1.1.0',
    date: '2025-01-10',
    changes: [
      '加葱姜蒜',
    ],
  },
  {
    version: '1.2.0',
    date: '2025-01-15',
    changes: [
      '起火烧油',
    ],
  },
  {
    version: '2.0.0',
    date: '2025-01-18',
    changes: [
      '爆炒牛肉',
    ],
  },
  {
    version: '2.0.1',
    date: '2025-01-20',
    changes: [
      '特辣',
    ],
  },
  {
    version: '2.0.2',
    date: '2026-07-21',
    changes: [
      '特辣 PLUS',
    ],
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
    <NavigationStack
      preferredColorScheme={actualMode}
      tint={colors.tint}
      foregroundStyle={colors.label}
      toolbarColorScheme={{ colorScheme: actualMode, bars: ['navigationBar'] }}
    >
      <List
        listStyle="plain"
        preferredColorScheme={actualMode}
        scrollContentBackground="hidden"
        background={<GlassBackground />}
        foregroundStyle={colors.label}
        tint={colors.tint}
        listRowSpacing={12}
        contentMargins={{ edges: 'horizontal', insets: 16, placement: 'scrollContent' }}
        navigationTitle="更新日志"
        navigationBarTitleDisplayMode="inline"
        toolbar={{
          cancellationAction: <Button title="关闭" role="close" action={() => dismiss()} />,
        }}
      >
        {changelogNewestFirst.map((entry, index) => (
          <Section
            key={`${entry.version}-${entry.date}`}
            listRowBackground={<ThemeRowBackground variant={index === 0 ? 'elevated' : 'surface'} />}
            header={(
              <HStack alignment="center" spacing={spacing.sm}>
                <Text font={fontSize.title3} fontWeight="bold" foregroundStyle={colors.tint}>
                  v{entry.version}
                </Text>
                {index === 0 ? (
                  <Text
                    font={fontSize.caption2}
                    fontWeight="semibold"
                    foregroundStyle={colors.background}
                    padding={{ top: 2, bottom: 2, leading: spacing.sm, trailing: spacing.sm }}
                    background={colors.tint}
                    clipShape="capsule"
                  >
                    最新
                  </Text>
                ) : null}
                <Text font={fontSize.footnote} foregroundStyle={colors.tertiaryLabel}>
                  {entry.date}
                </Text>
              </HStack>
            )}
          >
            {entry.changes.map((change) => (
              <HStack key={`${entry.version}-${change}`} spacing={spacing.sm} alignment="top">
                <Text foregroundStyle={colors.tint}>•</Text>
                <Text
                  font={fontSize.subheadline}
                  foregroundStyle={colors.secondaryLabel}
                  frame={{ maxWidth: 'infinity', alignment: 'leading' }}
                >
                  {change}
                </Text>
              </HStack>
            ))}
          </Section>
        ))}
      </List>
    </NavigationStack>
  )
}
