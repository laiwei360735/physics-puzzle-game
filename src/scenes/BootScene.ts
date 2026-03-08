/**
 * 启动场景 - 资源预加载
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 显示加载进度条
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      this.cameras.main.width / 2 - 160,
      this.cameras.main.height / 2 - 25,
      320,
      50
    );

    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      '加载中...',
      {
        font: '20px Arial',
        color: '#ffffff',
      }
    );
    loadingText.setOrigin(0.5);

    // 加载进度事件
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 - 15,
        300 * value,
        30
      );
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 加载游戏资源
    this.loadAssets();
  }

  create(): void {
    // 资源加载完成，跳转到菜单场景
    this.scene.start('MenuScene');
  }

  /**
   * 加载游戏资源
   */
  private loadAssets(): void {
    // 图片资源
    // this.load.image('background', 'assets/images/background.png');
    // this.load.image('player', 'assets/images/player.png');
    
    // 精灵图
    // this.load.atlas('sprites', 'assets/sprites/sprites.png', 'assets/sprites/sprites.json');
    
    // 音频
    // this.load.audio('bgm', 'assets/audio/bgm.mp3');
    // this.load.audio('jump', 'assets/audio/jump.mp3');

    // 示例资源 - 实际使用时替换为真实资源
    const graphics = this.make.graphics();
    graphics.fillStyle(0x00ff00);
    graphics.fillCircle(50, 50, 50);
    graphics.generateTexture('circle', 100, 100);
    graphics.clear();
    
    graphics.fillStyle(0xff0000);
    graphics.fillRect(0, 0, 100, 100);
    graphics.generateTexture('square', 100, 100);
    graphics.destroy();
  }
}
