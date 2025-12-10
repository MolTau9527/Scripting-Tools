# 🚀 useGlobalReducer

一个轻量级、高性能的全局状态管理库，专为现代应用设计。

## ✨ 特性

- 🎯 **极简 API** - 一个 Hook 解决所有问题
- ⚡ **精准更新** - 自动依赖收集，只更新相关组件
- 🔄 **原生异步** - 内置 Promise 支持，UI 状态自动化
- 💾 **可选持久化** - 一行代码实现数据持久化
- 🛡️ **TypeScript 优先** - 完整类型推导和类型安全
- 🔗 **跨组件共享** - 真正的全局状态
- 📦 **零依赖** - 基于原生 React Hooks
- 🎨 **并发友好** - Promise 链式处理，避免竞态条件

## 🚀 快速开始

### 基础用法

```typescript
import { useGlobalReducer } from "use-global-reducer";

// 定义 reducer
const counterReducer = (state, action) => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
    default:
      return state;
  }
};

// 创建全局状态
const useCounter = useGlobalReducer(counterReducer, { count: 0 });

// 组件 A - 显示计数
function Display() {
  const [state] = useCounter();
  return <h1>计数: {state.count}</h1>;
}

// 组件 B - 控制按钮
function Controls() {
  const [, dispatch] = useCounter();

  return (
    <VStack>
      <Button onClick={() => dispatch({ type: "increment" })}>+1</Button>
      <Button onClick={() => dispatch({ type: "decrement" })}>-1</Button>
      <Button onClick={() => dispatch({ type: "reset" })}>重置</Button>
    </VStack>
  );
}
```

### 异步状态管理

```typescript
// 异步 reducer
const userReducer = async (state, action) => {
  switch (action.type) {
    case "LOAD_USER":
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { ...state, user: { name: "John", id: 1 } };

    case "CLEAR_USER":
      return { ...state, user: null };

    default:
      return state;
  }
};

const useUser = useGlobalReducer(userReducer, { user: null });

function UserComponent() {
  const [state, dispatch, asyncState] = useUser();

  return (
    <VStack>
      <Button onClick={() => dispatch({ type: "LOAD_USER" })}>加载用户</Button>

      {/* 自动处理异步 UI 状态 */}
      <asyncState.AsyncComponent loading="正在加载用户...">
        {state.user ? (
          <Text>用户: {state.user.name}</Text>
        ) : (
          <Text>暂无用户信息</Text>
        )}
      </asyncState.AsyncComponent>
      <Button onClick={() => dispatch({ type: "CLEAR_USER" })}>清除用户</Button>
    </VStack>
  );
}
```

### 数据持久化

```typescript
// 添加第三个参数即可实现持久化
const useSettings = useGlobalReducer(
  settingsReducer,
  { theme: "light", lang: "zh" },
  "app-settings" // 持久化到 localStorage
);

function App() {
  const [settings, dispatch] = useSettings();

  return (
    <>
      <button
        onClick={() =>
          dispatch({
            type: "SET_THEME",
            payload: settings.theme === "light" ? "dark" : "light",
          })
        }
      >
        切换主题: {settings.theme}
      </button>
    </>
  );
}
```

### 灵活的 Action 类型

```typescript
const flexibleReducer = (state, action) => {
  // 支持多种 action 类型
  if (typeof action === "number") {
    return { count: action };
  }

  if (typeof action === "string") {
    switch (action) {
      case "reset":
        return { count: 0 };
      case "increment":
        return { count: state.count + 1 };
    }
  }

  if (typeof action === "function") {
    return action(state);
  }

  // 传统对象 action
  if (action?.type === "SET_VALUE") {
    return { ...state, value: action.payload };
  }

  return state;
};

const useFlexible = useGlobalReducer(flexibleReducer, { count: 0 });

function FlexibleComponent() {
  const [state, dispatch] = useFlexible();

  return (
    <VStack>
      <Text>计数: {state.count}</Text>
      <Button onClick={() => dispatch(42)}>设置为42</Button>
      <Button onClick={() => dispatch("reset")}>重置</Button>
      <Button onClick={() => dispatch("increment")}>+1</Button>
      <Button onClick={() => dispatch(s => ({ ...s, count: s.count * 2 }))}>
        翻倍
      </Button>
    </VStack>
  );
}
```

## 📚 API 参考

### `useGlobalReducer(reducer, initialState, storageKey?)`

创建一个全局状态管理器。

#### 参数

- **`reducer`** `(state, action?) => newState | Promise<newState>` - 状态更新函数
- **`initialState`** `State` - 初始状态值
- **`storageKey`** `string` (可选) - 持久化存储键名

#### 返回值

返回一个 Hook 函数，调用后返回 `[state, dispatch, asyncState]`：

- **`state`** - 当前状态（带依赖收集的代理对象）
- **`dispatch`** - 派发函数，支持多种 action 类型
- **`asyncState`** - 异步状态对象
  - `isReady: boolean` - 是否完成异步操作
  - `status: 'pending' | 'fulfilled' | 'rejected'` - 异步状态
  - `AsyncComponent: Component` - 异步 UI 组件

### Action 类型支持

```typescript
type Action =
  | { type: string | symbol; payload?: any; [key: string]: any } // 对象
  | string // 字符串
  | number // 数字
  | boolean // 布尔值
  | Function; // 函数式更新
```

### AsyncComponent 属性

```typescript
<asyncState.AsyncComponent
  loading="自定义加载文本或组件"
  error={errorMsg => <Text>错误: {errorMsg}</Text>}
>
  {/* 成功状态的内容 */}
  <Text>加载成功的内容</Text>
</asyncState.AsyncComponent>
```

## 🎯 核心概念

### 精准更新机制

组件只会在**实际访问的状态属性**发生变化时重新渲染：

```typescript
const useApp = useGlobalReducer(appReducer, {
  user: null,
  posts: [],
  settings: {},
});

// 组件 A - 只访问 user
function UserInfo() {
  const [state] = useApp();
  return <Text>{state.user?.name}</Text>; // 只有 user 变化时才重渲染
}

// 组件 B - 只访问 posts
function PostsList() {
  const [state] = useApp();
  return <Text>文章数: {state.posts.length}</Text>; // 只有 posts 变化时才重渲染
}
```

### 异步状态两阶段更新

#### 阶段 1：异步开始 - 精确控制

```typescript
// 只有触发异步的组件显示 loading，其他组件不受影响
function TriggerComponent() {
  const [state, dispatch, asyncState] = useGlobalState();

  return (
    <>
      <button onClick={() => dispatch({ type: "FETCH_DATA" })}>获取数据</button>

      {/* 只有这个组件显示 loading */}
      <asyncState.AsyncComponent loading="加载中...">
        <Text>数据: {state.data}</Text>
      </asyncState.AsyncComponent>
    </>
  );
}
```

#### 阶段 2：异步完成 - 精准更新

```typescript
// 异步完成后，只有访问相关状态的组件才重新渲染
function DataDisplay() {
  const [state] = useGlobalState();
  return <Text>{state.data}</Text>; // 访问了 data，会重新渲染
}

function UnrelatedComponent() {
  const [state] = useGlobalState();
  return <Text>{state.other}</Text>; // 只访问 other，不会重新渲染
}
```

### Promise 链式并发处理

当多个异步操作同时触发时，自动排队执行：

```typescript
const asyncReducer = async (state, action) => {
  switch (action.type) {
    case "FETCH_USER":
      const user = await api.getUser();
      return { ...state, user };

    case "FETCH_POSTS":
      const posts = await api.getPosts();
      return { ...state, posts };
  }
};

// 同时触发两个异步操作
dispatch({ type: "FETCH_USER" }); // 第一个执行
dispatch({ type: "FETCH_POSTS" }); // 等待第一个完成后执行
```

### 错误处理

```typescript
// 方式1：返回 Error 对象
const reducer = (state, action) => {
  if (action.type === "ERROR") {
    return new Error("发生错误");
  }
  return state;
};

// 方式2：在异步 reducer 中抛出错误
const asyncReducer = async (state, action) => {
  if (action.type === "FETCH_DATA") {
    throw new Error("网络请求失败");
  }
  return state;
};

// 在组件中处理错误
<asyncState.AsyncComponent error={msg => <Text>错误: {msg}</Text>}>
  <Text>成功内容</Text>
</asyncState.AsyncComponent>;
```

## 💡 最佳实践

### 1. 状态设计

推荐使用**扁平化状态结构**：

```typescript
// ✅ 推荐：扁平化
const goodState = {
  userName: "John",
  userAge: 25,
  appTheme: "dark",
};

// ❌ 避免：深层嵌套
const badState = {
  user: {
    profile: { name: "John", age: 25 },
  },
};
```

### 2. Reducer 设计

```typescript
// ✅ 支持同步和异步混合
const userReducer = async (state, action) => {
  switch (action.type) {
    case "SET_NAME":
      // 同步操作
      return { ...state, name: action.payload };

    case "LOAD_PROFILE":
      // 异步操作
      const profile = await api.loadProfile();
      return { ...state, profile };

    default:
      return state;
  }
};
```

### 3. 性能优化

```typescript
// ✅ 只访问需要的属性
function UserName() {
  const [state] = useUser();
  return <div>{state.userName}</div>; // 只依赖 userName
}

// ❌ 避免访问不需要的属性
function UserName() {
  const [state] = useUser();
  console.log(state); // 会创建对整个 state 的依赖
  return <Text>{state.userName}</Text>;
}
```

## 🎨 实际应用示例

### 购物车应用

```typescript
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const cartReducer = async (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const newItems = [...state.items];
      const existingIndex = newItems.findIndex(
        item => item.id === action.item.id
      );

      if (existingIndex >= 0) {
        newItems[existingIndex].quantity += action.quantity;
      } else {
        newItems.push({ ...action.item, quantity: action.quantity });
      }

      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return { items: newItems, total };

    case "CHECKOUT":
      // 模拟异步结账
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { items: [], total: 0 };

    default:
      return state;
  }
};

const useCart = useGlobalReducer(
  cartReducer,
  { items: [], total: 0 },
  "shopping-cart"
);

// 商品列表组件
function ProductList() {
  const dispatch = useCart()[1];

  return (
    <VStack>
      {products.map(product => {
        <VStack key={product.id}>
          <Text>{product.name}</Text>
          <Text>价格: ¥{product.price}</Text>
          <Button
            title="加入购物车"
            action={() => {
              dispatch({
                type: "ADD_ITEM",
                item: product,
                quantity: 1,
              });
            }}
          />
        </VStack>;
      })}
    </VStack>
  );
}

// 购物车组件
function Cart() {
  const [state, dispatch, asyncState] = useCart();

  return (
    <VStack>
      <Text>购物车 ({state.items.length})</Text>

      {state.items.map(item => (
        <VStack key={item.id}>
          <Text>{item.name}</Text>
          <Text>价格: ¥{item.price}</Text>
          <Text>数量: {item.quantity}</Text>
          <Text>小计: ¥{item.price * item.quantity}</Text>
        </VStack>
      ))}

      <div>总计: ¥{state.total}</div>

      <asyncState.AsyncComponent loading="结账中...">
        <Button
          onClick={() => dispatch({ type: "CHECKOUT" })}
          disabled={state.items.length === 0}
        >
          结账
        </Button>
      </asyncState.AsyncComponent>
    </VStack>
  );
}
```

## 🔌 中间件系统

中间件基于**观察者模式**设计，提供了强大的扩展能力。中间件可以在 action 派发过程中添加额外的逻辑，如日志记录、防抖、超时控制等。

### ⚠️ 重要说明

中间件采用**纯函数设计**，遵循单向数据流：

#### ✅ 中间件可以做的事情：

- **修改 Action**：标准化、增强、转换 action
- **控制执行**：决定是否派发、何时派发
- **派发额外 Action**：触发副作用、记录日志
- **观察和监控**：收集统计信息、性能监控

#### ❌ 中间件不应该做的事情：

- **直接修改状态**：破坏单向数据流
- **绕过 Reducer**：状态变更必须经过 reducer
- **产生副作用状态**：避免不可预测的状态变化

#### 💡 正确处理复杂场景：

```typescript
// ✅ 通过 action 组合实现复杂逻辑
const useAdvancedMiddleware = next => action => {
  // 预处理
  next({ type: "START_OPERATION", payload: action });

  // 执行主要逻辑
  const result = next(action);

  // 后处理
  next({ type: "END_OPERATION", payload: { action, result } });

  return result;
};
```

### 使用内置中间件

#### 1. 日志中间件 (useLogger)

记录 action 派发和状态变化的详细信息：

```typescript
import { useLogger, applyMiddleware } from "./middlewares";

const useGlobalState = useGlobalReducer(reducer, initialState);

function MyComponent() {
  const [state, baseDispatch] = useGlobalState();

  // 应用日志中间件
  const dispatch = useLogger(baseDispatch, "MyComponent", state);

  return (
    <Button onClick={() => dispatch({ type: "increment" })}>增加计数</Button>
  );
}
```

#### 2. 防抖中间件 (useDebounce)

防止频繁的 action 派发：

```typescript
import { useDebounce } from "./middlewares";

function SearchComponent() {
  const [state, baseDispatch] = useGlobalState();

  // 应用防抖中间件，延迟 300ms
  const dispatch = useDebounce(baseDispatch, 300, false);

  return (
    <input
      onChange={e =>
        dispatch({
          type: "SEARCH",
          payload: e.target.value,
        })
      }
    />
  );
}
```

#### 3. 超时中间件 (useTimeout)

为异步操作添加超时控制，防止长时间等待：

```typescript
import { useTimeout } from "./middlewares";

function DataFetchComponent() {
  const [state, baseDispatch] = useGlobalState();

  // 应用超时中间件，5秒超时，自定义超时处理
  const dispatch = useTimeout(
    baseDispatch,
    5000, // 超时时间 5 秒
    state => {
      console.warn("操作超时，返回默认状态");
      return { ...state, error: "请求超时，请重试" };
    }
  );

  return (
    <VStack>
      <Button onClick={() => dispatch({ type: "FETCH_DATA" })}>获取数据</Button>

      {/* 超时后会显示错误信息 */}
      {state.error && <Text color="red">{state.error}</Text>}
    </VStack>
  );
}
```

**超时中间件参数说明：**

- `timeout`: 超时时间（毫秒），可选
- `onTimeout`: 超时回调函数，接收当前状态并返回新状态，可选

**注意事项：**

- 超时中间件只对异步 reducer（返回 Promise）有效
- 如果不提供 `onTimeout`，默认会在控制台输出错误信息并返回原状态
- 超时机制通过 `Promise.race` 实现，确保异步操作不会无限等待

#### 4. 组合多个中间件

使用 `applyMiddleware` 组合多个中间件：

```typescript
import {
  useLogger,
  useDebounce,
  useTimeout,
  applyMiddleware,
} from "./middlewares";

function EnhancedComponent() {
  const [state, baseDispatch] = useGlobalState();

  // 组合多个中间件：先防抖，再记录日志，最后添加超时控制
  const dispatch = applyMiddleware(
    [useLogger, "EnhancedComponent", state],
    [useDebounce, 500, false],
    [useTimeout, 3000, state => ({ ...state, timeout: true })]
  )(baseDispatch);

  return (
    <VStack>
      <Button onClick={() => dispatch({ type: "async_action" })}>
        执行异步操作
      </Button>
      {state.timeout && <Text>操作已超时</Text>}
    </VStack>
  );
}
```

### 创建自定义中间件

中间件是一个高阶函数，接收 `next` 函数和可选参数，返回一个新的 dispatch 函数。

#### 中间件类型定义

```typescript
type Middleware<T extends Dispatch> = (
  next: T,
  ...args: any[]
) => (action: Parameters<T>[0]) => void;
```

#### 示例：条件执行中间件

```typescript
/**
 * 条件执行中间件 - 根据条件决定是否执行操作
 * 注意：此中间件遵循观察者模式，当条件不满足时
 * 不执行原始操作，但不修改 reducer 的状态
 * @param condition 执行条件函数
 */
export const useConditional = <T extends Dispatch>(
  next: T,
  condition: (action: Parameters<T>[0]) => boolean
) => {
  return (action: Parameters<T>[0]) => {
    // 检查执行条件
    if (condition(action)) {
      // 条件满足，执行原始操作并返回结果
      return next(action);
    }

    // 条件不满足，记录信息（观察者行为）但不执行操作
    console.warn("Action 被条件中间件拦截:", action);

    // 返回 undefined 表示操作被跳过，不修改状态
    return undefined;
  };
};
```

### 中间件最佳实践

#### 1. 中间件顺序

中间件的执行顺序很重要，通常遵循以下原则：

```typescript
// 推荐顺序：条件检查 -> 日志记录 -> 防抖/节流 -> 错误处理 -> 超时控制
const dispatch = applyMiddleware(
  [useConditional, action => action.type !== "IGNORE"],
  [useLogger, "MyComponent"],
  [useDebounce, 300],
  [useRetry, 3, 1000],
  [useTimeout, 5000]
)(baseDispatch);
```

#### 2. 性能考虑

- 避免在中间件中进行重复的计算
- 对于高频操作，优先使用防抖/节流中间件
- 合理设置超时时间，避免过长的等待
- **超时时间建议：**
  - 网络请求：3-10 秒
  - 文件操作：5-15 秒
  - 复杂计算：根据业务需求调整
  - 用户交互：1-3 秒（保持响应性）

#### 3. 错误处理

```typescript
export const useSafeMiddleware = <T extends Dispatch>(
  next: T,
  onError?: (error: Error) => void
) => {
  return (action: Parameters<T>[0]) => {
    try {
      const result = next(action);

      if (result instanceof Promise) {
        return result.catch(error => {
          onError?.(error);
          throw error;
        });
      }

      return result;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };
};
```

## 🔧 故障排除

### 常见问题

**Q: 为什么组件没有更新？**

A: 检查是否访问了状态属性。只有访问的属性变化才会触发更新。

**Q: 异步操作如何处理错误？**

A: 在异步 reducer 中抛出错误，或返回 Error 对象。

**Q: 如何实现状态持久化？**

A: 在创建 Hook 时提供 `storageKey` 参数。

**Q: 中间件的执行顺序是什么？**

A: 中间件按照 `applyMiddleware` 中的顺序执行，后面的中间件会包装前面的中间件。

**Q: 如何调试中间件？**

A: 使用 `useLogger` 中间件可以查看 action 的执行过程和状态变化。

**Q: 超时中间件为什么没有生效？**

A: 超时中间件只对异步 reducer（返回 Promise 的 reducer）有效。确保你的 reducer 返回 Promise，并且正确设置了超时时间。

**Q: 如何自定义超时处理逻辑？**

A: 在 `useTimeout` 的第三个参数中提供 `onTimeout` 回调函数，该函数接收当前状态并返回新的状态。

## 📄 许可证

MIT License

---

**让状态管理回归简单！**
