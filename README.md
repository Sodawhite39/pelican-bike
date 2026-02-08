# 鹈鹕骑自行车 🦩🚲

一款基于物理引擎的平衡骑行小游戏。控制一只鹈鹕骑自行车，在起伏的地形上保持平衡，骑得越远越好！

## 在线体验

**Web 版**：https://sodawhite39.github.io/pelican-bike/

**微信小游戏版**：开发完成，待上线（见下方上线指南）

---

## 项目结构

```
├── src/                    # Web 版源码
│   ├── entities/           # 实体（自行车、鹈鹕、组合体）
│   ├── input/              # 键盘输入
│   ├── physics/            # Matter.js 物理世界
│   ├── rendering/          # Canvas 2D 渲染
│   ├── terrain/            # 程序化地形生成
│   ├── ui/                 # HUD + Game Over 界面
│   ├── utils/              # 常量、数学函数、国际化
│   ├── Game.ts             # 游戏主循环
│   └── main.ts             # Web 入口
├── wx-mini-game/           # 微信小游戏版源码
│   ├── src/
│   │   ├── ads/            # 广告管理（激励视频 + 插屏）
│   │   ├── audio/          # Web Audio 程序化音效
│   │   ├── entities/       # 实体（与 Web 版共享）
│   │   ├── input/          # 触摸输入
│   │   ├── physics/        # Matter.js 物理世界
│   │   ├── rendering/      # 渲染 + 视差背景
│   │   ├── terrain/        # 程序化地形
│   │   ├── ui/             # HUD + Game Over（含复活/双倍）
│   │   ├── utils/          # 常量、数学、中文 i18n、Canvas polyfill
│   │   ├── Game.ts         # 游戏主循环（触摸 + 音效 + 广告）
│   │   ├── game-entry.ts   # 微信入口
│   │   └── wx-types.d.ts   # 微信 API 类型声明
│   ├── game.json           # 小游戏配置（横屏）
│   ├── project.config.json # 微信开发者工具配置
│   ├── build.mjs           # esbuild 构建脚本
│   └── game.js             # 构建产物（117KB）
├── .github/workflows/      # GitHub Actions 自动部署
├── index.html              # Web 版 HTML
├── package.json
└── vite.config.ts
```

---

## 技术栈

| 模块 | 技术 |
|------|------|
| 物理引擎 | Matter.js 0.20 |
| 渲染 | HTML5 Canvas 2D |
| 语言 | TypeScript 5.7 |
| Web 构建 | Vite |
| 微信构建 | esbuild（CJS, neutral platform） |
| 包管理 | Bun |
| 音效 | Web Audio API 程序化合成 |
| 部署 | GitHub Pages（Web）/ 微信小游戏平台 |

---

## 本地开发

### Web 版

```bash
bun install
bun run dev       # 启动开发服务器 localhost:5173
bun run build     # 构建到 dist/
```

### 微信小游戏版

```bash
cd wx-mini-game
bun install
bun run build             # 构建 → game.js (117KB)
node build.mjs --watch    # 开发模式（watch + sourcemap）
```

---

## 操控方式

### Web 版（键盘）

| 按键 | 功能 |
|------|------|
| ↑ | 蹬车加速 |
| ↓ | 刹车减速 |
| ← → | 倾斜平衡 |
| Z | 掉头 |
| Space | 开始 / 重玩 |

### 微信版（触摸）

屏幕分为 4 个触摸区域：

```
┌─────────────┬─────────────┐
│   左倾 ←    │    → 右倾   │
├─────────────┼─────────────┤
│   刹车 ↓    │    ↑ 蹬车   │
└─────────────┴─────────────┘
```

- 屏幕中央点击 = 掉头
- 任意点击 = 开始/重玩

---

## 游戏特性

### 核心玩法
- 基于真实物理的自行车平衡系统
- 程序化无限地形生成（难度渐进）
- 手绘极简美术风格（黑白线条 + 橙色点缀）

### 微信版增强功能

#### 音效系统（零外部文件）
所有音效通过 Web Audio API 实时合成，不增加任何包体大小：

| 音效 | 触发时机 | 合成方式 |
|------|---------|---------|
| 踩踏声 | 蹬车时 | 低频正弦波脉冲 220→120Hz |
| 刹车声 | 刹车时 | 高通滤波白噪声 |
| 风声 | 速度 > 3 时持续 | 低通滤波白噪声，音量随速度变化 |
| 碰撞声 | 摔倒时 | 低频 boom + 噪声爆发 |
| 结束音 | Game Over | 下行四音阶 G4→F4→E4→C4 |

#### 视差背景（4 层）

| 层 | 内容 | 视差系数 | 说明 |
|----|------|---------|------|
| 天空 | 渐变填充 | 0（静止） | #EEF2F7 → #FFFFFF |
| 远山 | Perlin noise 山丘 | 0.1 | 浅灰剪影 |
| 近丘 | 更大波浪轮廓 | 0.25 | 中灰剪影 |
| 装饰 | 云朵 + 树 + 小鸟 | 0.15~0.4 | 自动生成/回收 |

#### 最佳纪录
- `wx.setStorageSync` 本地持久化最高分
- Game Over 界面显示「最佳纪录：XXX 米」
- 破纪录时显示「🎉 新纪录！」

---

## GitHub 仓库

https://github.com/Sodawhite39/pelican-bike

### 自动部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署 Web 版到 GitHub Pages。

工作流：`.github/workflows/deploy.yml`
