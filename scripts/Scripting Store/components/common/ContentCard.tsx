import { VStack } from 'scripting'
import type { Color } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, spacing } from '../../utils/styles'

// VirtualNode 不接受 null/false，但 JSX 中的 `cond ? <X/> : null` 产生 `null`。
// 使用宽松的 children 类型允许消费者返回 null/undefined/false，
// 交由 Scripting 运行时自己过滤空节点。
type CardChild = JSX.Element | null | undefined | false

export interface ContentCardProps {
  children: CardChild | CardChild[]
  padding?: number
  spacing?: number
  background?: Color
  alignment?: 'leading' | 'center' | 'trailing'
}

export const ContentCard = ({
  children,
  padding = spacing.xl,
  spacing: stackSpacing = spacing.md,
  background,
  alignment,
}: ContentCardProps) => {
  const colors = useColors()

  return (
    <VStack
      padding={padding}
      background={background ?? colors.tertiaryBackground}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.lg }}
      spacing={stackSpacing}
      alignment={alignment}
    >
      {children}
    </VStack>
  )
}
