import { Button, Image, Text } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { fontSize } from '../../utils/styles'

export interface NavigationActionProps {
  type: 'back' | 'close'
  onPress: () => void
}

export const NavigationAction = ({ type, onPress }: NavigationActionProps) => {
  const colors = useColors()

  if (type === 'close') {
    return (
      <Button action={onPress}>
        <Image
          systemName="xmark.circle.fill"
          foregroundStyle={colors.tertiaryLabel}
          frame={{ width: 28, height: 28 }}
        />
      </Button>
    )
  }

  return (
    <Button action={onPress}>
      <Text font={fontSize.body} foregroundStyle={colors.tint}>返回</Text>
    </Button>
  )
}
