import { Button, HStack, Image, Text } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { spacing, fontSize } from '../../utils/styles'

// ============================================================
// Types
// ============================================================

export interface SectionHeaderProps {
  title: string
  action?: {
    label: string
    onPress: () => void
  }
}

// ============================================================
// Component
// ============================================================

export const SectionHeader = ({ title, action }: SectionHeaderProps) => {
  const colors = useColors()

  return (
    <HStack
      padding={{ leading: spacing.lg, trailing: spacing.lg, top: spacing.lg, bottom: spacing.sm }}
      alignment="center"
    >
      <Text
        font={fontSize.title2}
        fontWeight="bold"
        foregroundStyle={colors.label}
      >
        {title}
      </Text>

      {action && (
        <HStack frame={{ maxWidth: 'infinity', alignment: 'trailing' }}>
          <Button action={action.onPress}>
            <HStack
              spacing={spacing.xs}
              alignment="center"
            >
              <Text
                font={fontSize.body}
                foregroundStyle={colors.tint}
              >
                {action.label}
              </Text>
              <Image
                systemName="chevron.right"
                font={fontSize.caption1}
                foregroundStyle={colors.tint}
              />
            </HStack>
          </Button>
        </HStack>
      )}
    </HStack>
  )
}
