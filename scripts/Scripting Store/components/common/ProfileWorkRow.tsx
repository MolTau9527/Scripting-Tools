import { HStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, fontSize, spacing } from '../../utils/styles'
import type { Plugin } from '../../types'
import { PressableRow } from './PressableRow'
import { PluginSummary } from './PluginSummary'

// ============================================================
// Types
// ============================================================

export interface ProfileWorkRowProps {
  plugin: Plugin
  subtitle: string
  onPress: () => void
  trailing?: JSX.Element
}

// ============================================================
// Component
// ============================================================

export const ProfileWorkRow = ({
  plugin,
  subtitle,
  onPress,
  trailing,
}: ProfileWorkRowProps) => {
  const colors = useColors()

  return (
    <HStack
      padding={spacing.md}
      background={colors.tertiaryFill}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.md }}
      spacing={spacing.md}
      alignment="center"
    >
      <PressableRow onPress={onPress}>
        <PluginSummary
          plugin={plugin}
          title={plugin.name}
          subtitle={subtitle}
          titleFont={fontSize.subheadline}
          subtitleFont={fontSize.caption1}
          titleWeight="medium"
          spacing={spacing.md}
        />
      </PressableRow>

      {trailing}
    </HStack>
  )
}
