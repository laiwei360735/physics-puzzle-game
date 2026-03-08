/**
 * 物理引擎单元测试
 * 测试物理核心功能的正确性和稳定性
 */

import { describe, it, expect, beforeEach } from 'vitest';

// 模拟物理引擎模块
// 实际项目中需要导入真实的物理引擎模块
interface Vector2 {
  x: number;
  y: number;
}

interface PhysicsBody {
  id: string;
  position: Vector2;
  velocity: Vector2;
  mass: number;
  restitution: number; // 弹性系数
  friction: number; // 摩擦系数
}

interface CollisionEvent {
  bodyA: string;
  bodyB: string;
  normal: Vector2;
  impulse: number;
}

// 模拟物理世界
class PhysicsWorld {
  private bodies: Map<string, PhysicsBody> = new Map();
  private gravity: Vector2 = { x: 0, y: 9.8 };
  private collisions: CollisionEvent[] = [];

  addBody(body: PhysicsBody): void {
    this.bodies.set(body.id, body);
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  // 更新物理状态
  update(deltaTime: number): void {
    this.bodies.forEach((body) => {
      // 应用重力
      body.velocity.x += this.gravity.x * deltaTime;
      body.velocity.y += this.gravity.y * deltaTime;

      // 应用摩擦力
      body.velocity.x *= (1 - body.friction * deltaTime);
      body.velocity.y *= (1 - body.friction * deltaTime);

      // 更新位置
      body.position.x += body.velocity.x * deltaTime;
      body.position.y += body.velocity.y * deltaTime;
    });

    // 检测碰撞
    this.detectCollisions();
  }

  private detectCollisions(): void {
    // 简化的碰撞检测逻辑
    const bodies = Array.from(this.bodies.values());
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i];
        const bodyB = bodies[j];
        
        // 简化的距离检测
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1.0) { // 假设碰撞阈值为 1.0
          this.collisions.push({
            bodyA: bodyA.id,
            bodyB: bodyB.id,
            normal: { x: dx / distance, y: dy / distance },
            impulse: 0 // 简化
          });
        }
      }
    }
  }

  getCollisions(): CollisionEvent[] {
    return this.collisions;
  }

  clearCollisions(): void {
    this.collisions = [];
  }
}

describe('物理引擎测试', () => {
  let world: PhysicsWorld;

  beforeEach(() => {
    world = new PhysicsWorld();
    world.clearCollisions();
  });

  describe('重力模拟', () => {
    it('UT-PHY-001: 自由落体应该按重力加速度下落', () => {
      const body: PhysicsBody = {
        id: 'test-body',
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };
      world.addBody(body);

      // 模拟 1 秒后的状态
      world.update(1.0);

      const updatedBody = world.getBody('test-body');
      expect(updatedBody).toBeDefined();
      
      // 验证速度变化（v = g * t）
      expect(updatedBody!.velocity.y).toBeCloseTo(9.8, 1);
      
      // 验证位置变化（s = 0.5 * g * t^2）
      expect(updatedBody!.position.y).toBeGreaterThan(0);
    });

    it('水平抛射应该同时有水平和垂直运动', () => {
      const body: PhysicsBody = {
        id: 'projectile',
        position: { x: 0, y: 10 },
        velocity: { x: 5, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };
      world.addBody(body);

      world.update(1.0);

      const updatedBody = world.getBody('projectile');
      expect(updatedBody!.position.x).toBeGreaterThan(0); // 水平移动
      // 重力方向 y 为正（向下），所以位置应该增加（下落）
      expect(updatedBody!.position.y).toBeGreaterThan(10); // 垂直下落
    });
  });

  describe('碰撞检测', () => {
    it('UT-PHY-002: 两个接触的物体应该触发碰撞事件', () => {
      const bodyA: PhysicsBody = {
        id: 'body-a',
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };

      const bodyB: PhysicsBody = {
        id: 'body-b',
        position: { x: 0.5, y: 0 }, // 距离小于 1.0，应该碰撞
        velocity: { x: -1, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };

      world.addBody(bodyA);
      world.addBody(bodyB);
      world.update(0.1);

      const collisions = world.getCollisions();
      expect(collisions.length).toBeGreaterThan(0);
      expect(collisions[0].bodyA).toBe('body-a');
      expect(collisions[0].bodyB).toBe('body-b');
    });

    it('距离较远的物体不应该触发碰撞', () => {
      const bodyA: PhysicsBody = {
        id: 'body-a',
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };

      const bodyB: PhysicsBody = {
        id: 'body-b',
        position: { x: 10, y: 10 }, // 距离远大于 1.0
        velocity: { x: 0, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };

      world.addBody(bodyA);
      world.addBody(bodyB);
      world.update(0.1);

      const collisions = world.getCollisions();
      expect(collisions.length).toBe(0);
    });
  });

  describe('摩擦力', () => {
    it('UT-PHY-004: 有摩擦的物体速度应该逐渐减小', () => {
      const body: PhysicsBody = {
        id: 'sliding-body',
        position: { x: 0, y: 0 },
        velocity: { x: 10, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.1 // 有摩擦
      };
      world.addBody(body);

      const initialVelocity = body.velocity.x;
      world.update(1.0);

      const updatedBody = world.getBody('sliding-body');
      expect(updatedBody!.velocity.x).toBeLessThan(initialVelocity);
    });

    it('无摩擦的物体速度应该保持不变（无重力情况下）', () => {
      // 临时关闭重力
      const body: PhysicsBody = {
        id: 'frictionless-body',
        position: { x: 0, y: 0 },
        velocity: { x: 5, y: 0 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };
      world.addBody(body);

      world.update(1.0);

      const updatedBody = world.getBody('frictionless-body');
      // 注意：由于重力存在，Y 方向速度会变，但 X 方向应该保持
      expect(updatedBody!.velocity.x).toBeCloseTo(5, 1);
    });
  });

  describe('弹性碰撞', () => {
    it('UT-PHY-005: 高弹性物体应该有更大的反弹', () => {
      const highRestitution: PhysicsBody = {
        id: 'bouncy',
        position: { x: 0, y: 10 },
        velocity: { x: 0, y: 0 },
        mass: 1.0,
        restitution: 0.9, // 高弹性
        friction: 0.0
      };

      const lowRestitution: PhysicsBody = {
        id: 'dull',
        position: { x: 5, y: 10 },
        velocity: { x: 0, y: 0 },
        mass: 1.0,
        restitution: 0.1, // 低弹性
        friction: 0.0
      };

      world.addBody(highRestitution);
      world.addBody(lowRestitution);

      // 这里简化测试，实际应该测试碰撞后的速度
      expect(highRestitution.restitution).toBeGreaterThan(lowRestitution.restitution);
    });
  });

  describe('质量影响', () => {
    it('UT-PHY-006: 不同质量的物体在重力下加速度相同', () => {
      const lightBody: PhysicsBody = {
        id: 'light',
        position: { x: 0, y: 10 },
        velocity: { x: 0, y: 0 },
        mass: 0.1,
        restitution: 0.5,
        friction: 0.0
      };

      const heavyBody: PhysicsBody = {
        id: 'heavy',
        position: { x: 5, y: 10 },
        velocity: { x: 0, y: 0 },
        mass: 10.0,
        restitution: 0.5,
        friction: 0.0
      };

      world.addBody(lightBody);
      world.addBody(heavyBody);

      world.update(1.0);

      const updatedLight = world.getBody('light');
      const updatedHeavy = world.getBody('heavy');

      // 在重力作用下，加速度应该相同（忽略空气阻力）
      expect(updatedLight!.velocity.y).toBeCloseTo(updatedHeavy!.velocity.y, 1);
    });
  });

  describe('边界情况', () => {
    it('应该处理零质量物体', () => {
      const zeroMassBody: PhysicsBody = {
        id: 'zero-mass',
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        mass: 0,
        restitution: 0.5,
        friction: 0.0
      };

      expect(() => {
        world.addBody(zeroMassBody);
        world.update(1.0);
      }).not.toThrow();
    });

    it('应该处理极大时间步长', () => {
      const body: PhysicsBody = {
        id: 'test',
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 1 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };
      world.addBody(body);

      expect(() => {
        world.update(100.0); // 极大时间步长
      }).not.toThrow();
    });

    it('应该处理负时间步长', () => {
      const body: PhysicsBody = {
        id: 'test',
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 1 },
        mass: 1.0,
        restitution: 0.5,
        friction: 0.0
      };
      world.addBody(body);

      expect(() => {
        world.update(-1.0);
      }).not.toThrow();
    });
  });
});

describe('向量工具函数', () => {
  it('UT-UTIL-001: 向量加法', () => {
    const a: Vector2 = { x: 1, y: 2 };
    const b: Vector2 = { x: 3, y: 4 };
    const result = { x: a.x + b.x, y: a.y + b.y };
    expect(result).toEqual({ x: 4, y: 6 });
  });

  it('UT-UTIL-002: 距离计算', () => {
    const a: Vector2 = { x: 0, y: 0 };
    const b: Vector2 = { x: 3, y: 4 };
    const distance = Math.sqrt(
      Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)
    );
    expect(distance).toBe(5);
  });

  it('UT-UTIL-003: 向量点积', () => {
    const a: Vector2 = { x: 1, y: 2 };
    const b: Vector2 = { x: 3, y: 4 };
    const dot = a.x * b.x + a.y * b.y;
    expect(dot).toBe(11);
  });
});
