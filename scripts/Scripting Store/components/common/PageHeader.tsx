import { HStack, Spacer, Text, VStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { fontSize, spacing } from '../../utils/styles'

export interface PageHeaderProps {
  title: string
  leading?: JSX.Element
  leadingWidth?: number
  trailing?: JSX.Element
  trailingWidth?: number
}

export const PageHeader = ({
  title,
  leading,
  leadingWidth = 50,
  trailing,
  trailingWidth = 50,
}: PageHeaderProps) => {
  const colors = useColors()
  const leadingElement = leading ? leading : <VStack frame={{ width: leadingWidth }} />
  const trailingElement = trailing ? trailing : <VStack frame={{ width: trailingWidth }} />

  return (
    <HStack padding={spacing.lg} background={colors.background} alignment="center">
      {leadingElement}
      <Spacer />
      <Text font={fontSize.headline} fontWeight="semibold" foregroundStyle={colors.label}>
        {title}
      </Text>
      <Spacer />
      {trailingElement}
    </HStack>
  )
}
