import { Button, Image, ProgressView, Text, VStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { spacing, fontSize, iconSize } from '../../utils/styles'

// ============================================================
// Loading View
// ============================================================

export const LoadingView = () => {
  const colors = useColors()

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      spacing={spacing.lg}
      alignment="center"
    >
      <ProgressView />
      <Text font={fontSize.body} foregroundStyle={colors.secondaryLabel}>
        加载中...
      </Text>
    </VStack>
  )
}

// ============================================================
// Empty View
// ============================================================

export interface EmptyViewProps {
  icon: string
  message: string
}

export const EmptyView = ({ icon, message }: EmptyViewProps) => {
  const colors = useColors()

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      spacing={spacing.lg}
      alignment="center"
    >
      <Image
        systemName={icon}
        foregroundStyle={colors.tertiaryLabel}
        frame={{ width: iconSize.xxl, height: iconSize.xxl }}
      />
      <Text font={fontSize.body} foregroundStyle={colors.secondaryLabel}>
        {message}
      </Text>
    </VStack>
  )
}

// ============================================================
// Error View
// ============================================================

export interface ErrorViewProps {
  message: string
  onRetry: () => void
}

export const ErrorView = ({ message, onRetry }: ErrorViewProps) => {
  const colors = useColors()

  return (
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      spacing={spacing.lg}
      alignment="center"
    >
      <Image
        systemName="exclamationmark.circle"
        foregroundStyle={colors.systemRed}
        frame={{ width: iconSize.xxl, height: iconSize.xxl }}
      />
      <Text font={fontSize.body} foregroundStyle={colors.secondaryLabel}>
        {message}
      </Text>
      <Button action={onRetry}>
        <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.tint}>
          点击重试
        </Text>
      </Button>
    </VStack>
  )
}
