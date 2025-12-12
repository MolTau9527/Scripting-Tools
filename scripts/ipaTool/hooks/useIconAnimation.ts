/**
 * File: hooks/useIconAnimation.ts
 *
 * 图标动画 Hook
 * 提供上下浮动的动画效果
 */

import { useObservable, useMemo, useEffect } from "scripting";

/**
 * 图标动画 Hook
 * @param distance 移动距离，默认 5
 * @param duration 动画时长（秒），默认 1
 * @param initialOffset 初始偏移值，默认 0
 * @returns 包含 offset 和 animation 的对象，可通过 {...result} 展开到组件
 */
export const useIconAnimation = (
  distance: number = 5,
  duration: number = 1,
  initialOffset: number = 0
) => {
  const offsetY = useObservable(0);

  const animation = useMemo(() => {
    return {
      offset: { x: 0, y: initialOffset + offsetY.value },
      animation: {
        animation: Animation.linear(duration).repeatForever(),
        value: offsetY.value,
      },
    };
  }, [offsetY.value, initialOffset, duration]);

  useEffect(() => {
    offsetY.setValue(distance);
  }, [distance]);

  return animation;
};
