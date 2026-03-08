/**
 * 游戏通用工具函数
 */

import Phaser from 'phaser';

export class GameUtils {
  /**
   * 随机数（范围）
   */
  static randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * 随机整数
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 随机选择数组元素
   */
  static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 角度转弧度
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 弧度转角度
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * 限制数值范围
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 线性插值
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * 格式化时间
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 格式化分数
   */
  static formatScore(score: number): string {
    return score.toLocaleString();
  }

  /**
   * 创建渐变颜色
   */
  static createGradientColor(
    color1: number,
    color2: number,
    t: number
  ): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(this.lerp(r1, r2, t));
    const g = Math.round(this.lerp(g1, g2, t));
    const b = Math.round(this.lerp(b1, b2, t));

    return (r << 16) | (g << 8) | b;
  }

  /**
   * 检测矩形碰撞
   */
  static rectIntersect(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * 检测圆形碰撞
   */
  static circleIntersect(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }

  /**
   * 获取屏幕中心
   */
  static getScreenCenter(scene: Phaser.Scene): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2
    );
  }

  /**
   * 创建文本样式
   */
  static createTextStyle(
    size: number = 24,
    color: string = '#ffffff',
    family: string = 'Arial'
  ): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      font: `bold ${size}px ${family}`,
      color,
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    };
  }

  /**
   * 抖动效果
   */
  static shakeObject(
    object: Phaser.GameObjects.GameObject,
    duration: number = 200,
    intensity: number = 5
  ): void {
    const scene = object.scene;
    
    scene.tweens.add({
      targets: object,
      x: `+=${intensity}`,
      y: `+=${intensity}`,
      duration: 50,
      repeat: 3,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * 淡入效果
   */
  static fadeIn(
    object: Phaser.GameObjects.GameObject,
    duration: number = 500
  ): void {
    object.alpha = 0;
    object.scene.tweens.add({
      targets: object,
      alpha: 1,
      duration,
      ease: 'Power2',
    });
  }

  /**
   * 淡出效果
   */
  static fadeOut(
    object: Phaser.GameObjects.GameObject,
    duration: number = 500,
    onComplete?: () => void
  ): void {
    object.scene.tweens.add({
      targets: object,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete,
    });
  }

  /**
   * 保存数据到本地存储
   */
  static saveToStorage(key: string, data: any): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  /**
   * 从本地存储加载数据
   */
  static loadFromStorage(key: string): any {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse stored data:', e);
        }
      }
    }
    return null;
  }

  /**
   * 清除本地存储
   */
  static clearStorage(key?: string): void {
    if (typeof localStorage !== 'undefined') {
      if (key) {
        localStorage.removeItem(key);
      } else {
        localStorage.clear();
      }
    }
  }
}
