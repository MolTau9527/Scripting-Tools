import { Text, TextField, ZStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { fontSize } from '../../utils/styles'
import type { CommonViewProps } from 'scripting'

export interface InputFieldProps {
  value: string
  placeholder: string
  onChanged: (value: string) => void
  title?: string
  textInputAutocapitalization?: CommonViewProps['textInputAutocapitalization']
  autocorrectionDisabled?: CommonViewProps['autocorrectionDisabled']
  submitLabel?: CommonViewProps['submitLabel']
}

export const InputField = ({
  value,
  placeholder,
  onChanged,
  title = '',
  textInputAutocapitalization,
  autocorrectionDisabled,
  submitLabel,
}: InputFieldProps) => {
  const colors = useColors()

  return (
    <ZStack alignment="leading">
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
        foregroundStyle={colors.label}
      />
    </ZStack>
  )
}
