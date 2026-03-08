/**
 * Matter.js 物理辅助工具
 * 提供统一的 API 访问方式，避免 this.scene.matter 未定义问题
 */

import Phaser from 'phaser';

/**
 * 获取 Matter.js 物理实例
 * 在 Scene 中配置了 physics: { default: 'matter' } 后使用
 */
export function getMatterPhysics(scene: Phaser.Scene): any {
  return (scene.physics as any);
}

/**
 * 检查 Matter.js 是否已启用
 */
export function isMatterEnabled(scene: Phaser.Scene): boolean {
  const matter = getMatterPhysics(scene);
  return matter && matter.world !== undefined;
}
