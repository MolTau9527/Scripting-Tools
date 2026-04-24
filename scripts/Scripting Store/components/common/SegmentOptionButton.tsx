import { Button, HStack, Image, Text } from 'scripting'
import type { Color } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, createSymmetricPadding, fontSize, spacing } from '../../utils/styles'

export interface SegmentOptionButtonProps {
  label: string
  icon: string
  selected: boolean
  onPress: () => void
  selectedBackground?: Color
}

export const SegmentOptionButton = ({
  label,
  icon,
  selected,
  onPress,
  selectedBackground,
}: SegmentOptionButtonProps) => {
  const colors = useColors()
  const activeBackground = selectedBackground ? selectedBackground : colors.tint
  const inactiveForeground = colors.secondaryLabel
  const activeForeground = '#ffffff'

  return (
    <Button action={onPress}>
      <HStack
        padding={createSymmetricPadding(spacing.sm, spacing.md)}
        background={selected ? activeBackground : colors.tertiaryFill}
        clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
        alignment="center"
        spacing={spacing.xs}
      >
        <Image
          systemName={icon}
          foregroundStyle={selected ? activeForeground : inactiveForeground}
          frame={{ width: 16, height: 16 }}
        />
        <Text
          font={fontSize.footnote}
          fontWeight="medium"
          foregroundStyle={selected ? activeForeground : inactiveForeground}
        >
          {label}
        </Text>
      </HStack>
    </Button>
  )
}
