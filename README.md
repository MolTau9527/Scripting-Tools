# Scripting App 脚本集合

这是一个为 [Scripting App](https://scriptingapp.com) 开发的脚本集合，包含实用的 iOS 小组件和应用脚本。

## 脚本列表

### 1. WallpaperWidget - ACG 壁纸小组件

![icon](https://img.shields.io/badge/icon-square.2.layers.3d.fill-ee5c62)

一个精美的 ACG（动漫）壁纸小组件，让你的 iOS 桌面充满二次元风格。

**主要功能：**
- 🖼️ 随机展示高质量 ACG 图片
- ⏰ 支持自定义刷新间隔
- 🎯 可指定特定图片 ID
- 📱 支持 iOS 小组件显示

**技术特点：**
- 支持本地缓存，减少网络请求
- 优雅的加载状态和错误处理

---

### 2. qBitHelper - qBittorrent 远程监控

![icon](https://img.shields.io/badge/icon-tray.full.fill-1c8cff)

远程监控你的 qBittorrent 下载器状态，随时掌握下载进度。

**主要功能：**
- 📊 显示上传/下载速度
- 📈 历史数据图表展示
- 🔢 种子数量统计
- ⚙️ 灵活的服务器配置

**技术特点：**
- 完整的 qBittorrent Web API 封装
- 支持会话管理和自动登录
- 数据持久化存储

---

## 安装方法

1. 在 iOS 设备上安装 [Scripting App](https://apps.apple.com/app/scripting/id1528949952)
2. 下载对应脚本文件夹
3. 导入到 Scripting App 中
4. 根据需要配置脚本参数

## 目录结构

```
scripts/
├── WallpaperWidget/          # ACG 壁纸小组件
│   ├── script.json           # 脚本配置
│   ├── index.tsx             # 主入口
│   ├── widget.tsx            # 小组件实现
│   └── util/                # 工具模块
│       ├── ACGPhotoWidget.tsx
│       ├── PreviewHome.tsx
│       ├── SettingsPage.tsx
│       ├── api.ts
│       ├── storage.ts
│       └── types.ts
│
└── qBitHelper/               # qBittorrent 监控
    ├── script.json           # 脚本配置
    ├── index.tsx             # 主入口
    ├── widget.tsx            # 小组件实现
    ├── util/                # 工具模块
    │   ├── qbhelper.tsx
    │   ├── qbApi.ts
    │   └── QbDisplay.tsx
    └── pages/                # 页面组件
        └── SettingsPage.tsx
```

## 技术栈

- **框架**: React (TSX)
- **运行环境**: Scripting App (iOS)
- **UI 组件**: Scripting App 内置组件
- **状态管理**: useObservable

## 许可证

MIT License

## 相关链接

- [Scripting App 官网](https://scriptingapp.com)
- [Scripting App 文档](https://docs.scriptingapp.com)
