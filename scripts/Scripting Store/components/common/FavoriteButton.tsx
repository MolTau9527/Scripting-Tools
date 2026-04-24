import { Button, Image, useEffect, useState } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { isFollowingPlugin, subscribeFavoriteChange, toggleFollowPlugin } from '../../utils/userSettings'

const ICON_SIZE = 20
const ICON_FILLED = 'star.fill'
const ICON_EMPTY = 'star'

export interface FavoriteButtonProps {
  pluginId: string | number
  onToggle?: () => void
}

export const FavoriteButton = ({ pluginId, onToggle }: FavoriteButtonProps) => {
  const colors = useColors()
  const id = String(pluginId)

  // 订阅全局收藏变更，任何页面触发后本按钮都会重渲染
  const [, setVersion] = useState(0)
  useEffect(() => {
    const unsubscribe = subscribeFavoriteChange(() => setVersion(n => n + 1))
    return unsubscribe
  }, [])

  const isFollowed = isFollowingPlugin(id)

  return (
    <Button
      action={() => {
        toggleFollowPlugin(id)
        onToggle?.()
      }}
    >
      <Image
        systemName={isFollowed ? ICON_FILLED : ICON_EMPTY}
        foregroundStyle={isFollowed ? colors.systemYellow : colors.tertiaryLabel}
        frame={{ width: ICON_SIZE, height: ICON_SIZE }}
      />
    </Button>
  )
}
