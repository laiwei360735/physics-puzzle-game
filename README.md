# 物理益智微信小游戏

基于 Phaser 3 + Matter.js 的物理益智游戏，适配微信小游戏平台。

## 技术栈

- **游戏引擎**: Phaser 3.80.1
- **物理引擎**: Matter.js 0.19.0
- **语言**: TypeScript 5.3.3
- **打包工具**: Vite 5.0
- **目标平台**: 微信小游戏、Web

## 项目结构

```
physics-puzzle-game/
├── src/
│   ├── scenes/           # 游戏场景
│   │   ├── BootScene.ts         # 启动场景（资源加载）
│   │   ├── MenuScene.ts         # 菜单场景
│   │   ├── GameScene.ts         # 游戏主场景
│   │   ├── UIScene.ts           # UI 场景
│   │   ├── LevelCompleteScene.ts # 关卡完成场景
│   │   └── index.ts
│   ├── entities/         # 游戏实体
│   │   ├── Player.ts            # 玩家
│   │   ├── Obstacle.ts          # 障碍物
│   │   ├── Goal.ts              # 目标
│   │   └── index.ts
│   ├── systems/          # 系统模块
│   │   ├── LevelManager.ts      # 关卡管理
│   │   ├── CollisionSystem.ts   # 碰撞系统
│   │   ├── GameStateManager.ts  # 游戏状态管理
│   │   ├── InputManager.ts      # 输入管理
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   │   ├── PhysicsHelper.ts     # 物理辅助
│   │   ├── GameUtils.ts         # 通用工具
│   │   └── index.ts
│   ├── wx-adapter.ts     # 微信适配
│   └── main.ts           # 主入口
├── assets/               # 资源文件
│   ├── images/
│   ├── fonts/
│   └── audio/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 构建微信小游戏版本

```bash
npm run build:wechat
```

## 核心功能

### 1. 物理交互系统

- 基于 Matter.js 的完整物理模拟
- 支持刚体、碰撞、约束
- 拖拽、投掷等交互

### 2. 关卡系统

- 可配置的关卡数据
- 多种障碍物类型（静态、移动、旋转）
- 目标收集机制
- 星级评价

### 3. 游戏状态管理

- 完整的状态机（菜单、游戏、暂停、完成）
- 分数统计
- 进度保存

### 4. 输入系统

- 键盘控制
- 鼠标/触摸拖拽
- 手势识别（滑动）

### 5. 微信适配

- 屏幕适配
- 触摸优化
- 震动反馈
- 音频适配

## 游戏设计

### 玩法

1. 玩家通过拖拽、弹射等方式操控物理物体
2. 利用物理特性解决谜题
3. 收集所有目标到达终点
4. 在限定时间内获得更高分数

### 障碍物类型

- **静态障碍物**: 固定不动的平台、墙壁
- **移动障碍物**: 沿固定路径移动的平台
- **旋转障碍物**: 绕轴旋转的障碍
- **动态障碍物**: 受物理影响的物体

### 目标类型

- **普通目标**: 基础分数（50 分）
- **星星目标**: 高分奖励（100 分）
- **奖励目标**: 额外奖励（200 分）

## 扩展开发

### 添加新关卡

在 `LevelManager.ts` 中添加关卡数据：

```typescript
const levelX: LevelData = {
  id: X,
  name: '关卡名称',
  difficulty: 'easy',
  player: { x: 100, y: 400 },
  obstacles: [...],
  goals: [...],
  timeLimit: 60,
  targetScore: 100,
};
```

### 添加新实体

在 `entities/` 目录下创建新实体类，继承 `Phaser.GameObjects.Container` 或使用 Matter.js 身体。

### 自定义物理效果

使用 `PhysicsHelper` 工具类或 Matter.js API 实现特殊物理效果。

## 微信小游戏发布

1. 构建项目：`npm run build:wechat`
2. 下载微信开发者工具
3. 导入 `dist/` 目录
4. 配置 appid
5. 上传发布

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ES6+ 语法规范
- 组件化、模块化设计
- 注释关键逻辑

## 许可证

MIT License
