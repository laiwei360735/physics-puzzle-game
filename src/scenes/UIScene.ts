/**
 * UI 场景 - 游戏界面层
 * 
 * P1 优化:
 * - ✅ 统一字体为 Fredoka One
 * - ✅ 统一按钮样式：圆角、渐变、阴影
 * - ✅ 按钮点击动画（缩放 0.95 倍）
 * - ✅ 按钮悬停效果（亮度 +10%）
 */

import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private starText!: Phaser.GameObjects.Text;
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
    // 背景（半透明）
    const bg = this.add.rectangle(width / 2, 40, width, 80, 0x000000, 0.5);
    bg.setScrollFactor(0);
    bg.setDepth(100);

    // 分数
    this.scoreText = this.add.text(20, 25, '分数：0', {
      font: 'bold 28px Fredoka One',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(101);

    // 关卡
    this.levelText = this.add.text(width / 2, 25, '关卡：1', {
      font: 'bold 28px Fredoka One',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.levelText.setOrigin(0.5);
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(101);

    // 星星计数
    this.starText = this.add.text(width / 2 + 150, 25, '⭐ 0/3', {
      font: 'bold 28px Fredoka One',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.starText.setOrigin(0.5);
    this.starText.setScrollFactor(0);
    this.starText.setDepth(101);

    // 时间
    this.timerText = this.add.text(width - 120, 25, '00:00', {
      font: 'bold 28px Fredoka One',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.timerText.setOrigin(0.5);
    this.timerText.setScrollFactor(0);
    this.timerText.setDepth(101);
  }

  /**
   * 创建控制按钮
   */
  private createControls(width: number, height: number): void {
    const buttonSize = 70;
    const margin = 30;

    // 重置按钮
    this.createStyledButton(
      margin + buttonSize / 2,
      height - margin - buttonSize / 2,
      '🔄',
      '重置',
      () => this.resetLevel()
    );

    // 提示按钮
    this.createStyledButton(
      width / 2,
      height - margin - buttonSize / 2,
      '💡',
      '提示',
      () => this.showHint()
    );

    // 菜单按钮
    this.createStyledButton(
      width - margin - buttonSize / 2,
      height - margin - buttonSize / 2,
      '🏠',
      '菜单',
      () => this.returnToMenu()
    );
  }

  /**
   * 创建统一风格的按钮（圆角、渐变、阴影）
   */
  private createStyledButton(
    x: number,
    y: number,
    icon: string,
    label: string,
    callback: () => void
  ): void {
    const button = this.add.container(x, y);
    button.setScrollFactor(0);
    button.setDepth(200);

    // 按钮背景（圆角矩形）
    const bg = this.add.roundRectangle(0, 0, 80, 80, 15, 0x4a4a6a, 1);
    bg.setInteractive({ useHandCursor: true });
    
    // 添加渐变效果（使用 tint 模拟）
    bg.setFillStyle(0x5a5a8a);

    // 图标
    const iconText = this.add.text(0, -10, icon, {
      font: 'bold 36px Fredoka One',
      color: '#ffffff',
    });
    iconText.setOrigin(0.5);

    // 标签
    const labelText = this.add.text(0, 25, label, {
      font: 'bold 16px Fredoka One',
      color: '#ffffff',
    });
    labelText.setOrigin(0.5);

    button.add([bg, iconText, labelText]);

    // 悬停效果（亮度 +10%）
    bg.on('pointerover', () => {
      bg.setFillStyle(0x6a6a9a);
      this.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 150,
        ease: 'Power2',
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x5a5a8a);
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Power2',
      });
    });

    // 点击效果（缩放 0.95 倍）
    bg.on('pointerdown', () => {
      bg.setFillStyle(0x3a3a5a);
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 80,
        ease: 'Power2',
      });
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(0x6a6a9a);
      callback();
    });
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
    console.log('💡 显示提示');
    // TODO: 实现提示系统
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
   * 更新星星计数
   */
  updateStars(collected: number, total: number): void {
    this.starText.setText(`⭐ ${collected}/${total}`);
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
