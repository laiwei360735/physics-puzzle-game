/**
 * 游戏主入口
 * Physics Puzzle Game - Main Entry Point
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { wxAdapter } from './wx-adapter';

// 游戏配置
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },
      debug: false, // 生产环境关闭调试
    },
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    UIScene,
    LevelCompleteScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// 游戏实例
let game: Phaser.Game | null = null;

/**
 * 初始化游戏
 */
async function initGame(): Promise<void> {
  try {
    // 初始化微信适配
    await wxAdapter.init();

    // 创建游戏实例
    game = new Phaser.Game(config);

    console.log('游戏初始化成功');

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('游戏初始化失败:', error);
  }
}

/**
 * 处理窗口大小变化
 */
function handleResize(): void {
  if (game) {
    game.scale.resize(window.innerWidth, window.innerHeight);
  }
}

// 启动游戏
initGame();

// 导出游戏实例（用于调试）
export { game };
