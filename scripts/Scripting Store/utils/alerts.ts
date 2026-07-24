declare const Dialog: {
  alert: (options: { message: string; title?: string; buttonLabel?: string }) => Promise<void>
} | undefined

declare const alert: ((options: {
  message: string
  title?: string
  buttonLabel?: string
}) => Promise<void>) | undefined

export const showError = async (title: string, message: string): Promise<void> => {
  try {
    if (typeof Dialog !== 'undefined' && Dialog && typeof Dialog.alert === 'function') {
      await Dialog.alert({ title, message })
      return
    }
  } catch { /* fall through */ }

  try {
    if (typeof alert === 'function') {
      await alert({ title, message })
      return
    }
  } catch { /* fall through */ }

  try { console.error(`[${title}] ${message}`) } catch { /* ignore */ }
}
