import { Button, Text } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, createSymmetricPadding, fontSize, spacing } from '../../utils/styles'

export interface AuthorTagButtonProps {
  label: string
  onPress: () => void
}

export const AuthorTagButton = ({ label, onPress }: AuthorTagButtonProps) => {
  const colors = useColors()

  return (
    <Button action={onPress}>
      <Text
        font={fontSize.subheadline}
        foregroundStyle={colors.tint}
        padding={createSymmetricPadding(spacing.xs, spacing.md)}
        background={colors.tertiaryFill}
        clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
      >
        {label}
      </Text>
    </Button>
  )
}
