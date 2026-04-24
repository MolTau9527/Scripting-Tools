import { Button, HStack, Image, Text } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, createSymmetricPadding, fontSize, spacing } from '../../utils/styles'

export interface PrimaryCTAButtonProps {
  label: string
  onPress?: () => void
  icon?: string
  disabled?: boolean
}

export const PrimaryCTAButton = ({
  label,
  onPress,
  icon,
  disabled,
}: PrimaryCTAButtonProps) => {
  const colors = useColors()

  const content = (
    <HStack
      padding={createSymmetricPadding(spacing.md, spacing.xxl)}
      background={colors.tint}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
      alignment="center"
      spacing={spacing.sm}
      opacity={disabled ? 0.6 : 1}
    >
      {icon ? (
        <Image
          systemName={icon}
          foregroundStyle="#ffffff"
          frame={{ width: 18, height: 18 }}
        />
      ) : null}
      <Text font={fontSize.body} fontWeight="semibold" foregroundStyle="#ffffff">
        {label}
      </Text>
    </HStack>
  )

  return (
    <Button action={onPress || (() => {})} disabled={disabled || !onPress}>
      {content}
    </Button>
  )
}
