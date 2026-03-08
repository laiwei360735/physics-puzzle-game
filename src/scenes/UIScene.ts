/**
 * UI 场景 - 游戏界面层
 */

import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private timer: number = 0;
  private timerEvent!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 创建 UI 元素
    this.createTopBar(width);
    this.createControls(width, height);
    
    // 启动计时器
    this.startTimer();
  }

  /**
   * 创建顶部栏
   */
  private createTopBar(width: number): void {
    // 背景
    this.add.rectangle(width / 2, 40, width, 80, 0x000000, 0.5);

    // 分数
    this.scoreText = this.add.text(20, 25, '分数：0', {
      font: 'bold 28px Arial',
      color: '#ffffff',
    });

    // 关卡
    this.levelText = this.add.text(width / 2, 25, '关卡：1', {
      font: 'bold 28px Arial',
      color: '#ffffff',
    });
    this.levelText.setOrigin(0.5);

    // 时间
    this.timerText = this.add.text(width - 120, 25, '00:00', {
      font: 'bold 28px Arial',
      color: '#ffffff',
    });
    this.timerText.setOrigin(0.5);
  }

  /**
   * 创建控制按钮
   */
  private createControls(width: number, height: number): void {
    const buttonSize = 60;
    const margin = 20;

    // 重置按钮
    this.createCircleButton(
      margin + buttonSize / 2,
      height - margin - buttonSize / 2,
      buttonSize,
      '🔄',
      () => this.resetLevel()
    );

    // 提示按钮
    this.createCircleButton(
      width / 2,
      height - margin - buttonSize / 2,
      buttonSize,
      '💡',
      () => this.showHint()
    );

    // 菜单按钮
    this.createCircleButton(
      width - margin - buttonSize / 2,
      height - margin - buttonSize / 2,
      buttonSize,
      '🏠',
      () => this.returnToMenu()
    );
  }

  /**
   * 创建圆形按钮
   */
  private createCircleButton(
    x: number,
    y: number,
    size: number,
    text: string,
    callback: () => void
  ): void {
    const button = this.add.container(x, y);

    // 背景圆
    const bg = this.add.circle(0, 0, size / 2, 0x4a4a6a);
    bg.setInteractive({ useHandCursor: true });

    // 文字
    const btnText = this.add.text(0, 0, text, {
      font: 'bold 24px Arial',
      color: '#ffffff',
    });
    btnText.setOrigin(0.5);

    button.add([bg, btnText]);

    // 交互
    bg.on('pointerover', () => bg.setFillStyle(0x5a5a7a));
    bg.on('pointerout', () => bg.setFillStyle(0x4a4a6a));
    bg.on('pointerdown', () => {
      bg.setFillStyle(0x3a3a5a);
      callback();
    });
    bg.on('pointerup', () => bg.setFillStyle(0x5a5a7a));
  }

  /**
   * 启动计时器
   */
  private startTimer(): void {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * 更新计时器
   */
  private updateTimer(): void {
    this.timer++;
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    this.timerText.setText(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }

  /**
   * 重置关卡
   */
  private resetLevel(): void {
    this.scene.get('GameScene').scene.restart();
  }

  /**
   * 显示提示
   */
  private showHint(): void {
    // TODO: 实现提示系统
    console.log('显示提示');
  }

  /**
   * 返回菜单
   */
  private returnToMenu(): void {
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }

  /**
   * 更新分数显示
   */
  updateScore(score: number): void {
    this.scoreText.setText(`分数：${score}`);
  }

  /**
   * 更新关卡显示
   */
  updateLevel(level: number): void {
    this.levelText.setText(`关卡：${level}`);
  }

  /**
   * 停止计时器
   */
  stopTimer(): void {
    this.timerEvent.remove();
  }

  /**
   * 获取当前时间（秒）
   */
  getTime(): number {
    return this.timer;
  }
}
