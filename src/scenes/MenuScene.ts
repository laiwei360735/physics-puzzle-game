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

    // 开始按钮
    this.createButton(
      width / 2,
      height / 2,
      200,
      60,
      '开始游戏',
      () => {
        this.scene.start('GameScene', { level: 1 });
      }
    );

    // 关卡选择按钮
    this.createButton(
      width / 2,
      height / 2 + 80,
      200,
      60,
      '关卡选择',
      () => {
        // TODO: 打开关卡选择界面
        console.log('打开关卡选择');
      }
    );

    // 设置按钮
    this.createButton(
      width / 2,
      height / 2 + 160,
      200,
      60,
      '设置',
      () => {
        // TODO: 打开设置界面
        console.log('打开设置');
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
}
