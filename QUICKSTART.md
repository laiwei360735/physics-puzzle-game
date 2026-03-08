# 快速启动指南

## 环境要求

- Node.js >= 18.0
- npm >= 9.0
- 现代浏览器（Chrome/Firefox/Edge）

## 安装与运行

### 1. 安装依赖

```bash
cd /root/.openclaw/workspace/projects/physics-puzzle-game
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器访问：http://localhost:3000

### 3. 构建生产版本

```bash
npm run build
```

输出目录：`dist/`

## 项目结构速览

```
src/
├── main.ts              # 🚀 入口文件
├── wx-adapter.ts        # 📱 微信适配
├── scenes/              # 🎬 游戏场景
│   ├── BootScene.ts     # 加载场景
│   ├── MenuScene.ts     # 主菜单
│   ├── GameScene.ts     # 游戏主场景
│   ├── UIScene.ts       # UI 层
│   └── LevelCompleteScene.ts  # 通关场景
├── entities/            # 🎮 游戏实体
│   ├── Player.ts        # 玩家
│   ├── Obstacle.ts      # 障碍物
│   └── Goal.ts          # 目标
├── systems/             # ⚙️ 管理系统
│   ├── LevelManager.ts  # 关卡管理
│   ├── CollisionSystem.ts # 碰撞系统
│   ├── GameStateManager.ts # 状态管理
│   └── InputManager.ts  # 输入管理
└── utils/               # 🛠️ 工具类
    ├── PhysicsHelper.ts # 物理辅助
    └── GameUtils.ts     # 通用工具
```

## 核心 API

### 启动游戏

```typescript
import Phaser from 'phaser';
import { BootScene, MenuScene, GameScene } from './scenes';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },
    },
  },
  scene: [BootScene, MenuScene, GameScene],
};

const game = new Phaser.Game(config);
```

### 创建玩家

```typescript
import { Player } from './entities/Player';

const player = new Player(this, 100, 300);
```

### 创建障碍物

```typescript
import { Obstacle } from './entities/Obstacle';

const obstacle = new Obstacle(this, {
  x: 400,
  y: 450,
  type: 'static',
  shape: 'rectangle',
  width: 200,
  height: 20,
});
```

### 创建目标

```typescript
import { Goal } from './entities/Goal';

const goal = new Goal(this, {
  x: 700,
  y: 300,
  type: 'normal',
});

goal.on('collected', () => {
  console.log('目标收集！');
});
```

### 管理关卡

```typescript
import { levelManager } from './systems/LevelManager';

const level = levelManager.getLevel(1);
levelManager.setCurrentLevel(2);
levelManager.unlockNextLevel();
```

### 游戏状态

```typescript
import { GameStateManager } from './systems/GameStateManager';

const stateManager = new GameStateManager(this);

stateManager.setState('playing');
stateManager.pause();
stateManager.resume();
stateManager.addScore(100);
```

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # 构建 Web 版本
npm run build:wechat # 构建微信版本

# 预览
npm run preview      # 预览生产构建
```

## 调试技巧

### 开启物理调试

在 `GameScene.ts` 中：

```typescript
physics: {
  matter: {
    debug: true,  // 显示碰撞体
  },
}
```

### 查看日志

浏览器控制台查看游戏日志，包含：

- 场景切换
- 碰撞事件
- 分数变化
- 错误信息

### 微信开发者工具

1. 构建微信版本：`npm run build:wechat`
2. 打开微信开发者工具
3. 导入 `dist/` 目录
4. 使用真机调试

## 常见问题

### Q: 游戏无法启动？
A: 检查 Node.js 版本，确保安装了所有依赖。

### Q: 物理效果异常？
A: 检查 Matter.js 配置，确认物体有正确的物理身体。

### Q: 微信小游戏无法运行？
A: 确保使用了微信适配层，检查 wx 对象是否存在。

## 学习资源

- [Phaser 3 文档](https://photonstorm.github.io/phaser3-docs/)
- [Matter.js 文档](https://brm.io/matter-js/)
- [微信小游戏文档](https://developers.weixin.qq.com/minigame/dev/guide/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

---

**祝开发愉快！** 🎮
