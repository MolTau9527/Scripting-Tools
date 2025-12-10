/**
 * 文件：scripts/ipaTool/types/utils.ts
 * 说明：类型工具函数
 */

/**
 * 字面量类型展宽
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends bigint
  ? bigint
  : T extends symbol
  ? symbol
  : T;

/**
 * 深度可变 + 类型展宽
 */
export type DeepMutable<T> =
  // 先处理基础类型和字面量 (避免被 object 捕获)
  T extends string | number | boolean | bigint | symbol | null | undefined
    ? Widen<T>
    : // 处理数组
    T extends ReadonlyArray<infer U>
    ? Array<DeepMutable<U>>
    : // 处理 Map
    T extends ReadonlyMap<infer K, infer V>
    ? Map<DeepMutable<K>, DeepMutable<V>>
    : // 处理 Set
    T extends ReadonlySet<infer U>
    ? Set<DeepMutable<U>>
    : // 处理函数 (保持不变)
    T extends (...args: any[]) => any
    ? T
    : // 最后处理对象 (纯对象)
    T extends Record<string, any>
    ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
    : // 兜底
      T;
