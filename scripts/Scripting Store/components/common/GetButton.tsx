import { Button } from 'scripting'
import type { Color } from 'scripting'

// App Store 风格「获取」按钮 —— 实心 borderedProminent：
// 玻璃按钮在深色模式下可能被解析为白色胶囊，实心 tint 底在两种模式下渲染一致。
interface GetButtonProps {
  tint: Color
  onPress: () => void
  isLoading?: boolean
  disabled?: boolean
}

export const GetButton = ({ tint, onPress, isLoading, disabled }: GetButtonProps) => {
  return (
    <Button
      title={isLoading ? '安装中…' : '获取'}
      systemImage="arrow.down.circle"
      action={onPress}
      buttonStyle="borderedProminent"
      controlSize="small"
      tint={tint}
      disabled={disabled}
      accessibilityLabel={isLoading ? '安装中' : '获取插件'}
      accessibilityHint={isLoading ? '正在安装' : '轻点安装这个插件'}
    />
  )
}
