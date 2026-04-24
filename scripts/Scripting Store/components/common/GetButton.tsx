import { Button, Text } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, createSymmetricPadding, fontSize, spacing } from '../../utils/styles'

// App Store 风格的「获取」按钮
export interface GetButtonProps {
  onPress?: () => void
  isLoading?: boolean
  disabled?: boolean
}

export const GetButton = ({ onPress, isLoading, disabled }: GetButtonProps) => {
  const colors = useColors()

  return (
    <Button action={onPress || (() => {})} disabled={disabled || !onPress}>
      <Text
        font={fontSize.subheadline}
        fontWeight="bold"
        foregroundStyle={colors.tint}
        padding={createSymmetricPadding(spacing.sm, spacing.lg)}
        frame={{ minWidth: 72, minHeight: 32 }}
        background={colors.tertiaryFill}
        clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
        opacity={disabled ? 0.6 : 1}
      >
        {isLoading ? '...' : '获取'}
      </Text>
    </Button>
  )
}
