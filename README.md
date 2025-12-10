# Scripting App 脚本集合

这是一个为 [Scripting App](https://scriptingapp.com) 开发的脚本集合，包含实用的 iOS 小组件和应用脚本。

## 脚本列表

### 1. WallpaperWidget - ACG 壁纸小组件

一个精美的 ACG（动漫）壁纸小组件，让你的 iOS 桌面充满二次元风格。

**主要功能：**
- 随机展示高质量 ACG 图片
- 支持自定义刷新间隔
- 可指定特定图片 ID
- 支持 iOS 小组件显示

---

### 2. qBitHelper - qBittorrent/Transmission 远程监控

远程监控你的 qBittorrent 或 Transmission 下载器状态，随时掌握下载进度。

**主要功能：**
- 显示上传/下载速度
- 历史数据图表展示
- 种子数量统计
- 同时支持 qBittorrent 和 Transmission

---

### 3. ipaTool - IPA 下载与应用降级工具

> **声明：** 本脚本魔改自作者 **[小白脸](https://raw.githubusercontent.com/githubdulong/Script/master/ipaTool.scripting)**

一个功能强大的 IPA 包下载和应用降级工具，支持从 App Store 下载历史版本应用。

**主要功能：**
- App Store 应用搜索
- IPA 包下载
- 应用历史版本降级
- 下载任务管理
- 已下载文件管理
- Apple ID 登录管理

**运行依赖：**
- 需要 Surge 模块或 Loon 插件作为辅助支持（二选一）

**技术特点：**
- 完整的 Tab 导航界面（搜索、下载、文件、设置）
- 支持多语言（中文、英文、日文、德文、法文等）
- 下载进度实时显示
- 登录历史记录管理

**新增功能：**
- 免更新，商店不会检测新版本（可通过覆盖安装恢复检测新版本）

---

## 安装方法

1. 在 iOS 设备上安装 [Scripting App](https://apps.apple.com/us/app/scripting/id6479691128)
2. 下载对应脚本文件夹
3. 导入到 Scripting App 中
4. 根据需要配置脚本参数

## 目录结构

```
scripts/
├── WallpaperWidget/          # ACG 壁纸小组件
│   ├── script.json           # 脚本配置
│   └── utils/                # 工具模块
│       ├── api.ts
│       ├── storage.ts
│       └── types.ts
│
├── qBitHelper/               # qBittorrent/Transmission 监控
│   ├── script.json           # 脚本配置
│   ├── index.tsx             # 主入口
│   ├── widget.tsx            # 小组件实现
│   ├── utils/                # 工具模块
│   │   ├── qb/               # qBittorrent API
│   │   ├── tr/               # Transmission API
│   │   └── public/           # 公共组件
│   └── pages/                # 页面组件
│
└── ipaTool/                  # IPA 下载工具（魔改自小白脸）
    ├── script.json           # 脚本配置
    ├── index.tsx             # 主入口
    ├── components/           # 通用组件
    ├── hooks/                # React Hooks
    ├── modules/              # 功能模块
    │   └── download/         # 下载管理
    ├── pages/                # 页面组件
    │   ├── Search/           # 搜索页
    │   ├── Download/         # 下载页
    │   ├── Files/            # 文件页
    │   └── Settings/         # 设置页
    ├── services/             # 服务层
    │   ├── api/              # API 接口
    │   └── server/           # 服务管理
    ├── types/                # 类型定义
    └── utils/                # 工具函数
```

## 技术栈

- **框架**: React (TSX)
- **运行环境**: Scripting App (iOS)
- **UI 组件**: Scripting App 内置组件
- **状态管理**: useObservable

## 许可证

MIT License

## 相关链接

- [Scripting App 文档](https://scripting.fun/doc_v2/zh/guide/doc_v2/Quick%20Start)
