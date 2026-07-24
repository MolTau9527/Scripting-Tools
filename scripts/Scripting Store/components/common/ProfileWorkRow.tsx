import { HStack } from 'scripting'
import { fontSize, spacing } from '../../utils/styles'
import type { Plugin } from '../../types'
import type { SemanticColors } from '../../contexts/ThemeContext'
import { PressableRow } from './PressableRow'
import { PluginSummary } from './PluginSummary'

// ============================================================
// Types
// ============================================================

interface ProfileWorkRowProps {
  plugin: Plugin
  colors: SemanticColors
  subtitle: string
  onPress: () => void
  trailing?: JSX.Element
}

// ============================================================
// Component
// ============================================================

export const ProfileWorkRow = ({
  plugin,
  colors,
  subtitle,
  onPress,
  trailing,
}: ProfileWorkRowProps) => {
  return (
    <HStack
      padding={{ top: spacing.xs, bottom: spacing.xs }}
      spacing={spacing.md}
      alignment="center"
    >
      <PressableRow onPress={onPress}>
        <PluginSummary
          plugin={plugin}
          colors={colors}
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
