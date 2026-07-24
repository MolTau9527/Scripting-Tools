import { Button, useEffect, useState } from 'scripting'
import { isFollowingPlugin, subscribePluginFavoriteChange, toggleFollowPlugin } from '../../utils/userSettings'

const ICON_FILLED = 'star.fill'
const ICON_EMPTY = 'star'

interface FavoriteButtonProps {
  pluginId: string | number
}

export const FavoriteButton = ({ pluginId }: FavoriteButtonProps) => {
  const id = String(pluginId)
  const [isFollowed, setIsFollowed] = useState(() => isFollowingPlugin(id))

  useEffect(() => {
    setIsFollowed(isFollowingPlugin(id))
    const unsubscribe = subscribePluginFavoriteChange(id, setIsFollowed)
    return unsubscribe
  }, [id])

  return (
    <Button
      title={isFollowed ? '取消关注' : '关注'}
      systemImage={isFollowed ? ICON_FILLED : ICON_EMPTY}
      action={() => {
        toggleFollowPlugin(id)
      }}
      buttonStyle="plain"
      labelStyle="iconOnly"
      frame={{ width: 44, height: 44 }}
      accessibilityValue={isFollowed ? '已关注' : '未关注'}
    />
  )
}
