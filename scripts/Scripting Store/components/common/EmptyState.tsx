import { Image, Text, VStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { fontSize, spacing } from '../../utils/styles'

export interface EmptyStateProps {
  icon: string
  message: string
  iconSize?: number
  textFont?: number
  padding?: number
}

export const EmptyState = ({
  icon,
  message,
  iconSize = 40,
  textFont = fontSize.subheadline,
  padding = spacing.xl,
}: EmptyStateProps) => {
  const colors = useColors()

  return (
    <VStack padding={padding} spacing={spacing.sm}>
      <Image
        systemName={icon}
        font={32}
        foregroundStyle={colors.label}
        frame={{ width: iconSize, height: iconSize }}
      />
      <Text font={textFont} foregroundStyle={colors.tertiaryLabel}>
        {message}
      </Text>
    </VStack>
  )
}
