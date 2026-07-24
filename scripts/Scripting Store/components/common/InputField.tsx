import { HStack, Text, TextField, ZStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { fontSize, spacing } from '../../utils/styles'
import type { CommonViewProps, TextFieldProps } from 'scripting'

// 原生 TextField 的 prompt 占位符颜色跟随系统方案解析，深色模式下可能渲染为
// 深灰导致看不清；这里用语义色 Text 覆盖层自绘占位符，颜色始终跟随主题。
// title 在 SwiftUI 中不作为可见标签渲染，需要行首名称时传 label。
interface InputFieldProps {
  value: string
  placeholder: string
  onChanged: (value: string) => void
  title?: string
  /** 行首可见标签（如「名称」「描述」），固定宽度对齐 */
  label?: string
  textInputAutocapitalization?: CommonViewProps['textInputAutocapitalization']
  autocorrectionDisabled?: CommonViewProps['autocorrectionDisabled']
  submitLabel?: CommonViewProps['submitLabel']
  keyboardType?: CommonViewProps['keyboardType']
  textContentType?: CommonViewProps['textContentType']
  axis?: TextFieldProps['axis']
}

export const InputField = ({
  value,
  placeholder,
  onChanged,
  title = '',
  label,
  textInputAutocapitalization,
  autocorrectionDisabled,
  submitLabel,
  keyboardType,
  textContentType,
  axis,
}: InputFieldProps) => {
  const colors = useColors()

  const field = (
    <ZStack alignment="leading" frame={{ maxWidth: 'infinity' }}>
      <Text
        font={fontSize.body}
        foregroundStyle={colors.secondaryLabel}
        opacity={value ? 0 : 1}
        allowsHitTesting={false}
      >
        {placeholder}
      </Text>
      <TextField
        title={title}
        value={value}
        prompt=""
        onChanged={onChanged}
        textInputAutocapitalization={textInputAutocapitalization}
        autocorrectionDisabled={autocorrectionDisabled}
        submitLabel={submitLabel}
        keyboardType={keyboardType}
        textContentType={textContentType}
        axis={axis}
        foregroundStyle={colors.label}
      />
    </ZStack>
  )

  if (!label) return field

  return (
    <HStack spacing={spacing.md} alignment="center">
      <Text
        font={fontSize.subheadline}
        fontWeight="medium"
        foregroundStyle={colors.label}
        frame={{ width: 64, alignment: 'leading' }}
      >
        {label}
      </Text>
      {field}
    </HStack>
  )
}
