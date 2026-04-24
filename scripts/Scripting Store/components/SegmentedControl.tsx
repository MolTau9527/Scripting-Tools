import { Button, HStack, Text } from 'scripting'
import { useColors } from '../contexts/ThemeContext'
import { spacing, fontSize, cornerRadius } from '../utils/styles'
import type { SortType } from '../types'

// ============================================================
// Types
// ============================================================

export interface SegmentedControlProps {
  value: SortType
  onChange: (value: SortType) => void
}

interface Segment {
  value: SortType
  label: string
}

const segments: Segment[] = [
  { value: 'time', label: '最新' },
  { value: 'popular', label: '热门' },
]

// ============================================================
// Component - iOS Segmented Control 样式
// ============================================================

export const SegmentedControl = ({ value, onChange }: SegmentedControlProps) => {
  const colors = useColors()

  return (
    <HStack
      padding={3}
      background={colors.tertiaryFill}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
    >
      {segments.map((segment) => {
        const isSelected = segment.value === value

        return (
          <Button key={segment.value} action={() => onChange(segment.value)}>
            <Text
              font={fontSize.subheadline}
              fontWeight={isSelected ? 'semibold' : 'medium'}
              foregroundStyle={isSelected ? colors.label : colors.secondaryLabel}
              padding={{ leading: spacing.lg, trailing: spacing.lg, top: spacing.sm, bottom: spacing.sm }}
              frame={{ minHeight: 36 }}
              background={isSelected ? colors.tertiaryBackground : 'rgba(0,0,0,0)'}
              clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
            >
              {segment.label}
            </Text>
          </Button>
        )
      })}
    </HStack>
  )
}
