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
- 支持小组件三种尺寸（小/中/大）
- App Intent 快速切换客户端
- 每个客户端独立保存配置

---

### 3. 智慧交通 - 城市交通状况监控

实时查看城市交通状况的桌面小组件，让你出行前了解路况。

**主要功能：**
- 实时显示城市交通拥堵指数
- 拥堵等级可视化（畅通/缓行/拥堵/严重拥堵）
- 拥堵道路排行榜展示
- 早晚高峰拥堵预测
- 支持全国多城市切换

**数据来源：** 百度交通指数

---

### 4. Scripting Store - 插件中心

> **声明：** 本脚本仅做 App 适配，免访问网站。感谢原作者 [gallery.scripting.fun](https://gallery.scripting.fun) 提供网页服务。所有组件均收集自互联网，版权归原作者所有。

一个便捷的插件商店客户端，可在 App 内直接浏览、搜索和安装 Scripting 插件。

**主要功能：**
- 浏览插件列表
- 搜索插件（按名称/描述）
- 查看插件详情
- 一键安装插件
- 支持按时间/热度排序
- 发布自己的插件
- 个人中心管理

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
│   ├── index.tsx             # 主入口
│   ├── widget.tsx            # 小组件实现
│   └── utils/                # 工具模块
│       ├── api.ts            # API 接口
│       ├── storage.ts        # 存储管理
│       ├── types.ts          # 类型定义
│       ├── utils.ts          # 工具函数
│       ├── SettingsPage.tsx  # 设置页面
│       ├── PreviewHome.tsx   # 预览页面
│       └── ACGPhotoWidget.tsx # 壁纸组件
│
├── qBitHelper/               # qBittorrent/Transmission 监控
│   ├── script.json           # 脚本配置
│   ├── index.tsx             # 主入口
│   ├── widget.tsx            # 小组件实现
│   ├── app_intents.tsx       # App Intent 客户端切换
│   ├── utils/                # 工具模块
│   │   ├── qb/               # qBittorrent API
│   │   ├── tr/               # Transmission API
│   │   └── public/           # 公共组件
│   └── pages/                # 页面组件
│
├── 智慧交通/                  # 城市交通状况监控
│   ├── script.json           # 脚本配置
│   ├── index.tsx             # 主入口
│   ├── widget.tsx            # 小组件实现
│   └── pages/                # 页面组件
│       ├── settings.tsx      # 设置页
│       └── city_picker.tsx   # 城市选择器
│
├── Scripting Store/          # 插件中心
    ├── script.json           # 脚本配置
   ├── index.tsx             # 主入口
    ├── types.ts              # 类型定义
    ├── api/                  # API 接口
    ├── screens/              # 页面组件
    │   └── StoreScreen.tsx   # 商店主页
    ├── components/           # UI 组件
    │   ├── PluginList.tsx    # 插件列表
    │   ├── PluginCard.tsx    # 插件卡片
    │   ├── PluginDetail.tsx  # 插件详情
    │   ├── SearchBar.tsx     # 搜索栏
    │   ├── SubmitForm.tsx    # 发布表单
    │   └── MyProfile.tsx     # 个人中心
    └── utils/                # 工具模块
        ├── installer.ts      # 安装器
        └── userSettings.ts   # 用户设置

```

## 技术栈

- **框架**: React (TSX)
- **运行环境**: Scripting App (iOS)
- **UI 组件**: Scripting App 内置组件
- **数据持久化**: Storage API

## 许可证

MIT License

## 相关链接

- [Scripting App 文档](https://scripting.fun/doc_v2/zh/guide/doc_v2/Quick%20Start)
