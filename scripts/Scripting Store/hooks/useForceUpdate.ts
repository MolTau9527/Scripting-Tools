import { useState } from 'scripting'

export const useForceUpdate = (): (() => void) => {
  const [, setState] = useState(0)
  return () => setState(n => n + 1)
}
