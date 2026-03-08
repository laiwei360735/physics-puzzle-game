/**
 * 关卡完成场景
 */

import Phaser from 'phaser';

interface LevelCompleteData {
  level: number;
  score: number;
}

export class LevelCompleteScene extends Phaser.Scene {
  private level!: number;
  private score!: number;

  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  init(data: LevelCompleteData): void {
    this.level = data.level || 1;
    this.score = data.score || 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 半透明背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // 完成文字
    const completeText = this.add.text(
      width / 2,
      height / 3,
      '关卡完成!',
      {
        font: 'bold 48px Arial',
        color: '#00ff00',
      }
    );
    completeText.setOrigin(0.5);

    // 关卡信息
    this.add.text(
      width / 2,
      height / 2 - 50,
      `关卡 ${this.level}`,
      {
        font: '32px Arial',
        color: '#ffffff',
      }
    ).setOrigin(0.5);

    // 分数
    this.add.text(
      width / 2,
      height / 2,
      `分数：${this.score}`,
      {
        font: '32px Arial',
        color: '#ffff00',
      }
    ).setOrigin(0.5);

    // 星级评价
    this.createStars(width / 2, height / 2 + 60);

    // 下一关按钮
    this.createButton(
      width / 2 - 110,
      height / 2 + 150,
      200,
      60,
      '下一关',
      () => this.nextLevel()
    );

    // 重玩按钮
    this.createButton(
      width / 2 + 110,
      height / 2 + 150,
      200,
      60,
      '重玩',
      () => this.replayLevel()
    );
  }

  /**
   * 创建星级评价
   */
  private createStars(x: number, y: number): void {
    const stars = this.add.container(x, y);
    
    // 根据分数计算星级
    const starCount = this.calculateStars();
    
    for (let i = 0; i < 3; i++) {
      const star = this.add.text(
        (i - 1) * 50,
        0,
        i < starCount ? '⭐' : '☆',
        {
          font: '40px Arial',
        }
      );
      stars.add(star);
    }
  }

  /**
   * 计算星级
   */
  private calculateStars(): number {
    // 根据分数计算星级（示例逻辑）
    if (this.score >= 1000) return 3;
    if (this.score >= 500) return 2;
    return 1;
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

    const bg = this.add.rectangle(0, 0, width, height, 0x4a4a6a);
    bg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(0, 0, text, {
      font: 'bold 24px Arial',
      color: '#ffffff',
    });
    btnText.setOrigin(0.5);

    button.add([bg, btnText]);

    bg.on('pointerover', () => bg.setFillStyle(0x5a5a7a));
    bg.on('pointerout', () => bg.setFillStyle(0x4a4a6a));
    bg.on('pointerdown', () => {
      bg.setFillStyle(0x3a3a5a);
      callback();
    });
    bg.on('pointerup', () => bg.setFillStyle(0x5a5a7a));
  }

  /**
   * 进入下一关
   */
  private nextLevel(): void {
    this.scene.start('GameScene', { level: this.level + 1 });
  }

  /**
   * 重玩当前关卡
   */
  private replayLevel(): void {
    this.scene.start('GameScene', { level: this.level });
  }
}
