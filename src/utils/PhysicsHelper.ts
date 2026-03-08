/**
 * 物理辅助工具
 */

import Phaser from 'phaser';
import Matter from 'matter-js';

export class PhysicsHelper {
  /**
   * 创建向量
   */
  static createVector(x: number, y: number): Matter.Vector {
    return { x, y };
  }

  /**
   * 计算向量长度
   */
  static vectorLength(vector: Matter.Vector): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  /**
   * 归一化向量
   */
  static normalizeVector(vector: Matter.Vector): Matter.Vector {
    const length = this.vectorLength(vector);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: vector.x / length,
      y: vector.y / length,
    };
  }

  /**
   * 计算两点之间的距离
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  /**
   * 计算角度（弧度）
   */
  static angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * 施加冲击力
   */
  static applyImpulse(
    body: Matter.Body,
    point: Matter.Vector,
    force: number,
    angle: number
  ): void {
    const impulse = {
      x: Math.cos(angle) * force,
      y: Math.sin(angle) * force,
    };
    Matter.Body.applyForce(body, point, impulse);
  }

  /**
   * 设置速度
   */
  static setVelocity(body: Matter.Body, speed: number, angle: number): void {
    const velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
    Matter.Body.setVelocity(body, velocity);
  }

  /**
   * 限制速度
   */
  static limitVelocity(body: Matter.Body, maxSpeed: number): void {
    const velocity = body.velocity;
    const speed = this.vectorLength(velocity);

    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      Matter.Body.setVelocity(body, {
        x: velocity.x * scale,
        y: velocity.y * scale,
      });
    }
  }

  /**
   * 创建弹性约束
   */
  static createElasticConstraint(
    world: Matter.World,
    bodyA: Matter.Body,
    bodyB: Matter.Body | { x: number; y: number },
    stiffness: number = 0.1,
    length: number = 0
  ): Matter.Constraint {
    const constraint = Matter.Constraint.create({
      bodyA,
      bodyB: bodyB as Matter.Body,
      pointB: typeof (bodyB as any).id === 'undefined' ? (bodyB as { x: number; y: number }) : undefined,
      stiffness,
      length,
    });

    Matter.World.add(world, constraint);
    return constraint;
  }

  /**
   * 移除约束
   */
  static removeConstraint(world: Matter.World, constraint: Matter.Constraint): void {
    Matter.World.remove(world, constraint);
  }

  /**
   * 检测点是否在多边形内
   */
  static pointInPolygon(
    x: number,
    y: number,
    vertices: Matter.Vector[]
  ): boolean {
    let inside = false;
    const len = vertices.length;

    for (let i = 0, j = len - 1; i < len; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;

      if (
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * 旋转向量
   */
  static rotateVector(
    vector: Matter.Vector,
    angle: number
  ): Matter.Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    };
  }

  /**
   * 插值
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * 平滑阻尼
   */
  static smoothDamp(
    current: number,
    target: number,
    currentVelocity: number,
    smoothTime: number,
    deltaTime: number
  ): { value: number; velocity: number } {
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    const change = current - target;
    const temp = (currentVelocity + omega * change) * deltaTime;
    const velocity = (currentVelocity - omega * temp) * exp;
    const value = target + (change + temp) * exp;

    return { value, velocity };
  }
}
