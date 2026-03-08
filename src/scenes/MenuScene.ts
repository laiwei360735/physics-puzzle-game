/**
 * 菜单场景 - 游戏主菜单
 */

import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // 游戏标题
    const title = this.add.text(
      width / 2,
      height / 3,
      '物理益智',
      {
        font: 'bold 64px Arial',
        color: '#ffffff',
      }
    );
    title.setOrigin(0.5);

    const subtitle = this.add.text(
      width / 2,
      height / 3 + 60,
      'Physics Puzzle',
      {
        font: '32px Arial',
        color: '#888888',
      }
    );
    subtitle.setOrigin(0.5);

    // 开始游戏按钮（从教程开始）
    this.createButton(
      width / 2,
      height / 2,
      200,
      60,
      '开始游戏',
      () => {
        // 从教程关卡 -3 开始
        this.scene.start('GameScene', { level: -3 });
      }
    );

    // 快速开始（跳过教程）
    this.createButton(
      width / 2,
      height / 2 + 80,
      200,
      60,
      '快速开始',
      () => {
        this.scene.start('GameScene', { level: 1 });
      }
    );

    // 关卡选择按钮
    this.createButton(
      width / 2,
      height / 2 + 160,
      200,
      60,
      '关卡选择',
      () => {
        this.scene.start('GameScene', { level: 1 });
      }
    );

    // 设置按钮
    this.createButton(
      width / 2,
      height / 2 + 240,
      200,
      60,
      '设置',
      () => {
        // 显示简单的设置提示
        this.showSettingsPanel();
      }
    );
  }

  /**
   * 创建按钮
   */
  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    callback: () => void
  ): void {
    const button = this.add.container(x, y);

    // 按钮背景
    const bg = this.add.rectangle(0, 0, width, height, 0x4a4a6a);
    bg.setInteractive({ useHandCursor: true });

    // 按钮文字
    const btnText = this.add.text(0, 0, text, {
      font: 'bold 24px Arial',
      color: '#ffffff',
    });
    btnText.setOrigin(0.5);

    button.add([bg, btnText]);

    // 按钮交互
    bg.on('pointerover', () => {
      bg.setFillStyle(0x5a5a7a);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4a4a6a);
    });

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x3a3a5a);
      callback();
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(0x5a5a7a);
    });
  }

  /**
   * 显示设置面板
   */
  private showSettingsPanel(): void {
    const { width, height } = this.cameras.main;
    
    // 创建半透明背景
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    
    // 设置面板
    const panel = this.add.container(width / 2, height / 2);
    const panelBg = this.add.rectangle(0, 0, 400, 300, 0x2a2a4e);
    panel.add(panelBg);
    
    // 标题
    const title = this.add.text(0, -100, '设置', {
      font: 'bold 32px Arial',
      color: '#ffffff',
    });
    title.setOrigin(0.5);
    panel.add(title);
    
    // 音效开关
    const soundText = this.add.text(0, -30, '音效：开启', {
      font: '20px Arial',
      color: '#ffffff',
    });
    soundText.setOrigin(0.5);
    panel.add(soundText);
    
    // 关闭按钮
    const closeBtn = this.add.text(0, 100, '关闭', {
      font: 'bold 24px Arial',
      color: '#ffffff',
      backgroundColor: '#ff4444',
      padding: { x: 20, y: 10 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);
  }
}
