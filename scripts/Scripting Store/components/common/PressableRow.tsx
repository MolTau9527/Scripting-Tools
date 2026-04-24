import { HStack } from 'scripting'

export interface PressableRowProps {
  onPress: () => void
  children: JSX.Element
}

// 注意：这里不能使用 <Button>，因为父容器外层会再放置独立的 <Button>（如 GetButton / FavoriteButton），
// SwiftUI 在「Button 内嵌 Button」结构下，内层按钮的点击会被外层 Button 吞掉，
// 导致「获取」按钮点击无反应。改为 HStack + onTapGesture 之后，
// 行的空白区域可点击，同一层级的子 Button 也能独立接收点击。
export const PressableRow = ({ onPress, children }: PressableRowProps) => {
  return (
    <HStack
      frame={{ maxWidth: 'infinity' }}
      contentShape={{ type: 'rect', cornerRadii: { topLeading: 0, topTrailing: 0, bottomLeading: 0, bottomTrailing: 0 } }}
      onTapGesture={onPress}
    >
      {children}
    </HStack>
  )
}
