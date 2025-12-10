// File: utils/deepProxy.ts
// 说明：深度代理工具 - 为嵌套对象创建代理，支持拦截所有层级的属性访问和修改

type DeepProxyHandler<T> = {
  set: (
    target: any,
    key: string | symbol,
    newValue: any,
    oldValue: any
  ) => void;
};

/**
 * 创建深度代理对象，支持在对象被修改后执行副作用操作
 * @param obj 要代理的对象
 * @param handler 代理处理器，set 回调会在对象属性修改后执行
 * @returns 代理后的对象
 */
export const deepProxy = <T extends Record<string | symbol, any>>(
  obj: T,
  handler: DeepProxyHandler<T>
): T => {
  // 使用 WeakMap 缓存已创建的代理，避免重复代理和循环引用问题
  const proxyCache = new WeakMap<object, any>();

  const createProxy = (target: any): any => {
    // 如果不是对象或为 null，直接返回
    if (!target || typeof target !== "object") {
      return target;
    }

    // 如果已经代理过，返回缓存的代理
    if (proxyCache.has(target)) {
      return proxyCache.get(target);
    }

    const proxy = new Proxy(target, {
      get(t, key, receiver) {
        const value = Reflect.get(t, key, receiver);

        // 如果是对象，返回其代理版本
        if (value && typeof value === "object") {
          return createProxy(value);
        }

        return value;
      },

      set(t, key, value, receiver) {
        const oldValue = Reflect.get(t, key, receiver);

        // 值未改变时，跳过处理
        if (oldValue === value) {
          return true;
        }

        // 如果新值是对象，创建代理
        const newValue = createProxy(value);

        const success = Reflect.set(t, key, newValue, receiver);

        // 修改成功后执行副作用回调
        if (success) {
          handler.set(t, key, newValue, oldValue);
        }

        return success;
      },

      deleteProperty(t, key) {
        const oldValue = Reflect.get(t, key);
        const success = Reflect.deleteProperty(t, key);

        if (success) {
          handler.set(t, key, undefined, oldValue);
        }

        return success;
      },
    });

    // 缓存代理对象
    proxyCache.set(target, proxy);
    return proxy;
  };

  return createProxy(obj);
};
