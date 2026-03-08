/**
 * 新手引导管理器
 * 负责教程关卡的文字提示、手势动画和交互指导
 * 
 * 功能:
 * - 显示文字提示（气泡框样式）
 * - 播放手势动画（手指拖动指示）
 * - 3 秒后自动淡出
 * - 支持多个教程关卡
 */

import Phaser from 'phaser';

export interface TutorialHint {
  levelId: number;
  text: string;
  position?: { x: number; y: number };
  duration?: number;
  showGesture?: boolean;
  gestureType?: 'drag' | 'swipe' | 'tap';
}

export class TutorialManager {
  private scene: Phaser.Scene;
  private currentHint: TutorialHint | null = null;
  private hintContainer: Phaser.GameObjects.Container | null = null;
  private gestureGraphics: Phaser.GameObjects.Graphics | null = null;
  private hintText: Phaser.GameObjects.Text | null = null;
  private fadeTween: Phaser.Tweens.Tween | null = null;

  // 教程关卡配置
  private readonly tutorialHints: Map<number, TutorialHint> = new Map([
    [-3, {
      levelId: -3,
      text: '拖动糖果让它摆动',
      position: { x: 400, y: 150 },
      duration: 3000,
      showGesture: true,
      gestureType: 'drag',
    }],
    [-2, {
      levelId: -2,
      text: '滑动屏幕切割绳子',
      position: { x: 400, y: 150 },
      duration: 3000,
      showGesture: true,
      gestureType: 'swipe',
    }],
    [-1, {
      levelId: -1,
      text: '收集 3 颗星星，让糖果进入嘴巴',
      position: { x: 400, y: 150 },
      duration: 3000,
      showGesture: false,
    }],
  ]);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 开始教程关卡
   */
  startTutorial(levelId: number): void {
    const hint = this.tutorialHints.get(levelId);
    if (!hint) {
      console.log(`教程关卡 ${levelId} 无提示配置`);
      return;
    }

    this.currentHint = hint;
    this.showHint(hint);
  }

  /**
   * 显示提示
   */
  private showHint(hint: TutorialHint): void {
    const { width, height } = this.scene.cameras.main;
    const posX = hint.position?.x ?? width / 2;
    const posY = hint.position?.y ?? height / 3;

    // 创建提示容器
    this.hintContainer = this.scene.add.container(posX, posY);
    this.hintContainer.setDepth(10000); // 最高层级

    // 创建气泡背景
    const bubbleWidth = 500;
    const bubbleHeight = 100;
    const bubble = this.scene.add.roundRectangle(
      0,
      0,
      bubbleWidth,
      bubbleHeight,
      20, // 圆角半径
      0x000000,
      0.85 // 透明度
    );
    this.hintContainer.add(bubble);

    // 创建气泡边框
    const border = this.scene.add.roundRectangle(
      0,
      0,
      bubbleWidth,
      bubbleHeight,
      20,
      0x00a8ff, // 蓝色边框
      1
    );
    border.setStrokeStyle(3, 0x00a8ff);
    this.hintContainer.add(border);

    // 创建提示文字
    this.hintText = this.scene.add.text(0, 0, hint.text, {
      font: 'bold 32px Fredoka One',
      color: '#ffffff',
      wordWrap: { width: bubbleWidth - 40 },
      align: 'center',
    });
    this.hintText.setOrigin(0.5);
    this.hintContainer.add(this.hintText);

    // 淡入动画
    this.hintContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: this.hintContainer,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    });

    // 如果配置了手势动画，显示手势
    if (hint.showGesture && hint.gestureType) {
      this.showGesture(hint.gestureType, posX, posY + 80);
    }

    // 3 秒后淡出
    const duration = hint.duration ?? 3000;
    this.fadeTween = this.scene.tweens.add({
      targets: this.hintContainer,
      alpha: 0,
      delay: duration,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.hideHint();
      },
    });

    console.log(`📖 显示教程提示：${hint.text}`);
  }

  /**
   * 显示手势动画
   */
  private showGesture(type: 'drag' | 'swipe' | 'tap', x: number, y: number): void {
    this.gestureGraphics = this.scene.add.graphics();
    this.gestureGraphics.setDepth(10001);

    if (type === 'drag' || type === 'swipe') {
      // 绘制手指图标和移动轨迹
      const fingerColor = 0xffccaa;
      const trailColor = 0x00a8ff;

      // 绘制手指（简化为圆形 + 矩形）
      const finger = this.scene.add.container(x - 100, y);
      
      // 手指主体
      const fingerBody = this.scene.add.ellipse(0, 0, 30, 40, fingerColor);
      finger.add(fingerBody);

      // 指甲
      const nail = this.scene.add.ellipse(0, -10, 15, 15, 0xffaaaa);
      finger.add(nail);

      // 移动轨迹箭头
      this.gestureGraphics.lineStyle(4, trailColor, 0.8);
      this.gestureGraphics.beginPath();
      this.gestureGraphics.moveTo(x - 80, y);
      this.gestureGraphics.lineTo(x + 80, y);
      
      // 箭头头部
      this.gestureGraphics.lineTo(x + 70, y - 10);
      this.gestureGraphics.moveTo(x + 80, y);
      this.gestureGraphics.lineTo(x + 70, y + 10);
      this.gestureGraphics.strokePath();

      // 手指摆动动画
      this.scene.tweens.add({
        targets: finger,
        x: x - 80,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: 2,
      });

      // 3 秒后移除手势
      this.scene.time.delayedCall(3000, () => {
        finger.destroy();
        this.gestureGraphics?.destroy();
      });
    } else if (type === 'tap') {
      // 点击手势（波纹效果）
      const ripple = this.scene.add.circle(x, y, 0, 0x00a8ff, 0.6);
      
      this.scene.tweens.add({
        targets: ripple,
        scale: 3,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        repeat: 2,
        onComplete: () => {
          ripple.destroy();
        },
      });
    }
  }

  /**
   * 隐藏提示
   */
  private hideHint(): void {
    if (this.hintContainer) {
      this.hintContainer.destroy();
      this.hintContainer = null;
    }
    if (this.gestureGraphics) {
      this.gestureGraphics.destroy();
      this.gestureGraphics = null;
    }
    this.hintText = null;
    this.currentHint = null;
  }

  /**
   * 提前关闭提示（玩家已理解）
   */
  dismissHint(): void {
    if (this.fadeTween) {
      this.fadeTween.remove();
    }
    this.hideHint();
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.dismissHint();
    this.tutorialHints.clear();
  }
}
