import { AppEvents, useEffect, useMemo, useRef, useState } from 'scripting'
import type { DragGestureDetails, ScenePhase, ScrollViewProxy } from 'scripting'
import type { Plugin } from '../types'
import { getPluginKey } from '../utils/plugin'

const TRACK_COPY_COUNT = 3
const MIDDLE_COPY_INDEX = 1
const AUTOPLAY_START_DELAY_MS = 1500
const MANUAL_RESUME_DELAY_MS = 2500
const SCROLL_LOCK_RELEASE_MS = 16
const ANIMATION_SETTLE_MS = 16

interface FeaturedTrackItem {
  key: string
  copyIndex: number
  pluginIndex: number
  plugin: Plugin
}

interface FeaturedCarouselOptions {
  proxy: ScrollViewProxy
  plugins: Plugin[]
  itemStride: number
  speed: number
  isPaused?: boolean
}

interface TimerRef {
  current: number | null
}

const getTrackItemKey = (copyIndex: number, pluginIndex: number, plugin: Plugin): string =>
  `featured-${copyIndex}-${pluginIndex}-${getPluginKey(plugin)}`

const clearTimer = (timerRef: TimerRef): void => {
  if (timerRef.current === null) return
  clearTimeout(timerRef.current)
  timerRef.current = null
}

export const useFeaturedCarousel = ({
  proxy,
  plugins,
  itemStride,
  speed,
  isPaused = false,
}: FeaturedCarouselOptions) => {
  const initialPosition = plugins[0]
    ? getTrackItemKey(MIDDLE_COPY_INDEX, 0, plugins[0])
    : null
  const [isVisible, setIsVisible] = useState(false)
  const [isSceneActive, setIsSceneActive] = useState(true)
  const [isScrollLocked, setIsScrollLocked] = useState(false)
  const resumeTimerRef = useRef<number | null>(null)
  const handoffTimerRef = useRef<number | null>(null)
  const scrollUnlockTimerRef = useRef<number | null>(null)
  const visibleItemKeyRef = useRef<string | null>(initialPosition)
  const autoplayItemKeyRef = useRef<string | null>(initialPosition)
  const activePluginKeyRef = useRef<string | null>(plugins[0] ? getPluginKey(plugins[0]) : null)
  const visibleItemKeysRef = useRef<string[]>(initialPosition ? [initialPosition] : [])
  const dragDirectionRef = useRef<-1 | 0 | 1>(0)
  const hasPositionedRef = useRef(false)
  const generationRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isNormalizingRef = useRef(false)

  const trackItems = useMemo<FeaturedTrackItem[]>(() => {
    const items: FeaturedTrackItem[] = []
    for (let copyIndex = 0; copyIndex < TRACK_COPY_COUNT; copyIndex += 1) {
      plugins.forEach((plugin, pluginIndex) => {
        items.push({
          key: getTrackItemKey(copyIndex, pluginIndex, plugin),
          copyIndex,
          pluginIndex,
          plugin,
        })
      })
    }
    return items
  }, [plugins])

  const stepDurationSeconds = Math.max(1, itemStride / speed)

  const getTrackIndex = (key: string): number =>
    trackItems.findIndex(item => item.key === key)

  const getCurrentItem = (): FeaturedTrackItem | null =>
    trackItems.find(item => item.key === visibleItemKeyRef.current) ?? null

  const updatePrimaryVisibleItem = () => {
    const visibleKeys = visibleItemKeysRef.current.filter(key => getTrackIndex(key) >= 0)
    if (visibleKeys.length === 0) return

    const orderedKeys = [...visibleKeys].sort((a, b) => getTrackIndex(a) - getTrackIndex(b))
    const primaryKey = dragDirectionRef.current < 0
      ? orderedKeys[orderedKeys.length - 1]
      : dragDirectionRef.current > 0
        ? orderedKeys[0]
        : visibleItemKeyRef.current && orderedKeys.includes(visibleItemKeyRef.current)
          ? visibleItemKeyRef.current
          : orderedKeys[0]

    if (primaryKey) {
      visibleItemKeyRef.current = primaryKey
      const primaryItem = trackItems.find(item => item.key === primaryKey)
      if (primaryItem) activePluginKeyRef.current = getPluginKey(primaryItem.plugin)
    }
  }

  const normalizeToMiddleCopy = (requestedPluginIndex?: number): FeaturedTrackItem | null => {
    if (plugins.length === 0) return null

    const currentItem = getCurrentItem()
    const savedPluginIndex = activePluginKeyRef.current
      ? plugins.findIndex(plugin => getPluginKey(plugin) === activePluginKeyRef.current)
      : -1
    const pluginIndex = Math.min(
      Math.max(requestedPluginIndex ?? currentItem?.pluginIndex ?? savedPluginIndex, 0),
      plugins.length - 1,
    )
    const middleKey = getTrackItemKey(MIDDLE_COPY_INDEX, pluginIndex, plugins[pluginIndex])
    visibleItemKeyRef.current = middleKey
    autoplayItemKeyRef.current = middleKey
    activePluginKeyRef.current = getPluginKey(plugins[pluginIndex])
    proxy.scrollTo(middleKey, 'leading')
    hasPositionedRef.current = true
    return trackItems.find(item => item.key === middleKey) ?? null
  }

  const canAutoplay = () => (
    plugins.length > 1 &&
    isVisible &&
    isSceneActive &&
    !isPaused &&
    !isDraggingRef.current
  )

  const cancelAutoplay = (freezeAtVisibleItem = false) => {
    generationRef.current += 1
    isNormalizingRef.current = false
    clearTimer(resumeTimerRef)
    clearTimer(handoffTimerRef)
    clearTimer(scrollUnlockTimerRef)

    const visibleKey = visibleItemKeyRef.current
    if (
      freezeAtVisibleItem &&
      visibleKey &&
      trackItems.some(item => item.key === visibleKey)
    ) {
      proxy.scrollTo(visibleKey, 'leading')
    }
  }

  const scheduleAutoplayHandoff = (generation: number) => {
    clearTimer(handoffTimerRef)
    handoffTimerRef.current = setTimeout(() => {
      handoffTimerRef.current = null
      if (generationRef.current !== generation || !canAutoplay()) return
      isNormalizingRef.current = false
      runAutoplayStep(generation)
    }, 0)
  }

  function runAutoplayStep(generation: number): void {
    if (generationRef.current !== generation || !canAutoplay()) return

    dragDirectionRef.current = 0
    let currentItem = trackItems.find(item => item.key === autoplayItemKeyRef.current) ?? null
    if (!currentItem && !hasPositionedRef.current) currentItem = normalizeToMiddleCopy(0)
    if (!currentItem) return

    if (currentItem.copyIndex === TRACK_COPY_COUNT - 1) {
      isNormalizingRef.current = true
      currentItem = normalizeToMiddleCopy(currentItem.pluginIndex)
      if (!currentItem) {
        isNormalizingRef.current = false
        return
      }
      scheduleAutoplayHandoff(generation)
      return
    }

    const currentTrackIndex = getTrackIndex(currentItem.key)
    const targetItem = trackItems[currentTrackIndex + 1]
    if (!targetItem) {
      isNormalizingRef.current = true
      const normalizedItem = normalizeToMiddleCopy(currentItem.pluginIndex)
      if (!normalizedItem) {
        isNormalizingRef.current = false
        return
      }
      scheduleAutoplayHandoff(generation)
      return
    }

    void withAnimation(
      Animation.linear(stepDurationSeconds),
      () => proxy.scrollTo(targetItem.key, 'leading'),
    )

    clearTimer(handoffTimerRef)
    handoffTimerRef.current = setTimeout(() => {
      handoffTimerRef.current = null
      if (generationRef.current !== generation || !canAutoplay()) return
      visibleItemKeyRef.current = targetItem.key
      autoplayItemKeyRef.current = targetItem.key
      activePluginKeyRef.current = getPluginKey(targetItem.plugin)
      runAutoplayStep(generation)
    }, stepDurationSeconds * 1000 + ANIMATION_SETTLE_MS)
  }

  const startAutoplay = (delayMs = AUTOPLAY_START_DELAY_MS) => {
    cancelAutoplay()
    if (!canAutoplay()) return

    const generation = generationRef.current
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null
      if (generationRef.current !== generation || !canAutoplay()) return
      runAutoplayStep(generation)
    }, delayMs)
  }

  useEffect(() => {
    const handleScenePhase = (phase: ScenePhase) => {
      setIsSceneActive(phase === 'active')
    }

    AppEvents.scenePhase.addListener(handleScenePhase)
    return () => AppEvents.scenePhase.removeListener(handleScenePhase)
  }, [])

  useEffect(() => {
    cancelAutoplay(!isVisible || !isSceneActive || isPaused)
    isDraggingRef.current = false
    dragDirectionRef.current = 0
    setIsScrollLocked(false)

    if (plugins.length === 0) {
      hasPositionedRef.current = false
      visibleItemKeyRef.current = null
      autoplayItemKeyRef.current = null
      activePluginKeyRef.current = null
    } else if (isVisible) {
      normalizeToMiddleCopy()
    }

    if (plugins.length > 1 && isVisible && isSceneActive && !isPaused) {
      startAutoplay()
    }

    return () => cancelAutoplay()
  }, [plugins, isVisible, isSceneActive, isPaused])

  const handleManualDragChanged = (details: DragGestureDetails) => {
    if (!isDraggingRef.current) {
      isDraggingRef.current = true
      cancelAutoplay()
      setIsScrollLocked(false)
    }

    if (details.translation.width < 0) dragDirectionRef.current = -1
    else if (details.translation.width > 0) dragDirectionRef.current = 1
  }

  const handleManualDragEnded = (details: DragGestureDetails) => {
    const finalVelocity = details.velocity.width
    const finalMotion = Math.abs(finalVelocity) > 1 ? finalVelocity : details.translation.width
    if (finalMotion < 0) dragDirectionRef.current = -1
    else if (finalMotion > 0) dragDirectionRef.current = 1

    updatePrimaryVisibleItem()
    isDraggingRef.current = false
    if (!isVisible || !isSceneActive || isPaused || plugins.length <= 1) {
      dragDirectionRef.current = 0
      setIsScrollLocked(false)
      return
    }

    cancelAutoplay()
    setIsScrollLocked(true)
    const generation = generationRef.current
    scrollUnlockTimerRef.current = setTimeout(() => {
      scrollUnlockTimerRef.current = null
      if (generationRef.current !== generation) return

      updatePrimaryVisibleItem()
      autoplayItemKeyRef.current = visibleItemKeyRef.current
      dragDirectionRef.current = 0
      setIsScrollLocked(false)
      if (canAutoplay()) startAutoplay(MANUAL_RESUME_DELAY_MS)
    }, SCROLL_LOCK_RELEASE_MS)
  }

  const handleVisibleItemsChanged = (ids: unknown[]) => {
    visibleItemKeysRef.current = ids.filter((id): id is string => typeof id === 'string')
    if (!isDraggingRef.current && !isNormalizingRef.current) {
      updatePrimaryVisibleItem()
    }
  }

  const handleAppear = () => {
    normalizeToMiddleCopy()
    setIsVisible(true)
  }

  const handleItemActivated = (itemKey: string) => {
    const item = trackItems.find(candidate => candidate.key === itemKey)
    if (!item) return

    visibleItemKeyRef.current = item.key
    autoplayItemKeyRef.current = item.key
    activePluginKeyRef.current = getPluginKey(item.plugin)
  }

  return {
    trackItems,
    isScrollLocked,
    handleVisibleItemsChanged,
    handleItemActivated,
    handleAppear,
    handleDisappear: () => setIsVisible(false),
    handleManualDragChanged,
    handleManualDragEnded,
  }
}
