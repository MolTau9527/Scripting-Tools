import { MutableRefObject } from "scripting";

/**
 * 创建代理状态对象的函数
 * @param state 原始状态对象
 * @param selectors 选择器引用对象
 * @returns 代理状态对象
 */
export const createProxyState = (
  state: unknown,
  selectors: MutableRefObject<Record<string, any>>
) => {
  if (typeof state !== "object") return state;
  return new Proxy(Object.assign(Object.create(null), state), {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (selectors.current) {
        selectors.current[prop as string] = value;
      }
      return value;
    },
  });
};