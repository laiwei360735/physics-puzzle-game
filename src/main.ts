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
 * 已修复 P0: 添加错误处理和超时保护
 */
async function initGame(): Promise<void> {
  const startTime = Date.now();
  
  try {
    console.log('🎮 游戏开始初始化...');
    
    // 初始化微信适配（带超时）
    console.log('📱 初始化微信适配器...');
    await Promise.race([
      wxAdapter.init(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('微信适配超时')), 3000)
      )
    ]);
    console.log('✅ 微信适配器初始化完成');

    // 创建游戏实例
    console.log('🎲 创建游戏实例...');
    game = new Phaser.Game(config);
    
    // 监听游戏创建完成
    game.events.once('ready', () => {
      const loadTime = Date.now() - startTime;
      console.log(`✅ 游戏初始化成功，耗时：${loadTime}ms`);
    });

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    console.log('✅ 游戏初始化完成');
  } catch (error) {
    console.error('❌ 游戏初始化失败:', error);
    
    // 隐藏加载界面，避免永久卡住
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }
    
    // 尝试创建游戏（降级模式）
    try {
      game = new Phaser.Game(config);
      console.log('✅ 游戏已降级模式启动');
    } catch (fallbackError) {
      console.error('❌ 降级模式也失败:', fallbackError);
    }
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
