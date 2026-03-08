/**
 * 关卡系统单元测试
 * 测试关卡加载、验证、进度管理等功能
 */

import { describe, it, expect, beforeEach } from 'vitest';

// 关卡数据结构
interface LevelConfig {
  id: string;
  name: string;
  difficulty: number;
  objects: LevelObject[];
  winConditions: WinCondition[];
  loseConditions: LoseCondition[];
  timeLimit?: number;
}

interface LevelObject {
  id: string;
  type: 'player' | 'target' | 'obstacle' | 'prop';
  position: { x: number; y: number };
  properties: Record<string, any>;
}

interface WinCondition {
  type: 'reach_target' | 'collect_all' | 'time_bonus';
  targetId?: string;
  count?: number;
}

interface LoseCondition {
  type: 'fall_out' | 'time_out' | 'collision';
  threshold?: number;
}

interface LevelProgress {
  levelId: string;
  stars: number;
  bestTime?: number;
  completed: boolean;
  unlocked: boolean;
}

// 关卡管理器
class LevelManager {
  private levels: Map<string, LevelConfig> = new Map();
  private progress: Map<string, LevelProgress> = new Map();
  private currentLevelId: string | null = null;

  // 加载关卡配置
  loadLevel(config: LevelConfig): void {
    if (!config.id || !config.name) {
      throw new Error('Invalid level config: missing id or name');
    }
    if (config.difficulty < 1 || config.difficulty > 5) {
      throw new Error('Invalid difficulty: must be 1-5');
    }
    this.levels.set(config.id, config);
  }

  // 获取关卡配置
  getLevel(levelId: string): LevelConfig | undefined {
    return this.levels.get(levelId);
  }

  // 验证关卡数据
  validateLevel(config: LevelConfig): boolean {
    if (!config.id) return false;
    if (!config.name) return false;
    if (config.difficulty < 1 || config.difficulty > 5) return false;
    if (!config.objects || config.objects.length === 0) return false;
    if (!config.winConditions || config.winConditions.length === 0) return false;
    return true;
  }

  // 设置当前关卡
  setCurrentLevel(levelId: string): boolean {
    const level = this.levels.get(levelId);
    if (!level) return false;
    this.currentLevelId = levelId;
    return true;
  }

  getCurrentLevelId(): string | null {
    return this.currentLevelId;
  }

  // 检查胜利条件
  checkWinCondition(state: GameState): boolean {
    const level = this.currentLevelId ? this.levels.get(this.currentLevelId) : null;
    if (!level) return false;

    for (const condition of level.winConditions) {
      if (!this.evaluateWinCondition(condition, state)) {
        return false;
      }
    }
    return true;
  }

  private evaluateWinCondition(condition: WinCondition, state: GameState): boolean {
    switch (condition.type) {
      case 'reach_target':
        return state.playerReachedTargets.includes(condition.targetId || '');
      case 'collect_all':
        return state.collectedItems.length >= (condition.count || 0);
      case 'time_bonus':
        return state.elapsedTime < (condition.count || Infinity);
      default:
        return false;
    }
  }

  // 检查失败条件
  checkLoseCondition(state: GameState): boolean {
    const level = this.currentLevelId ? this.levels.get(this.currentLevelId) : null;
    if (!level) return false;

    for (const condition of level.loseConditions) {
      if (this.evaluateLoseCondition(condition, state)) {
        return true;
      }
    }
    return false;
  }

  private evaluateLoseCondition(condition: LoseCondition, state: GameState): boolean {
    switch (condition.type) {
      case 'fall_out':
        return state.playerPosition.y < (condition.threshold || -100);
      case 'time_out':
        return state.elapsedTime > (condition.threshold || Infinity);
      case 'collision':
        return state.playerCollidedWithObstacles;
      default:
        return false;
    }
  }

  // 保存进度
  saveProgress(progress: LevelProgress): void {
    this.progress.set(progress.levelId, progress);
  }

  // 加载进度
  getProgress(levelId: string): LevelProgress | undefined {
    return this.progress.get(levelId);
  }

  // 解锁下一关
  unlockNextLevel(currentLevelId: string): void {
    const levelIndex = Array.from(this.levels.keys()).indexOf(currentLevelId);
    if (levelIndex >= 0 && levelIndex < this.levels.size - 1) {
      const nextLevelId = Array.from(this.levels.keys())[levelIndex + 1];
      const progress = this.progress.get(nextLevelId) || {
        levelId: nextLevelId,
        stars: 0,
        completed: false,
        unlocked: false
      };
      progress.unlocked = true;
      this.progress.set(nextLevelId, progress);
    }
  }

  // 重置关卡
  resetLevel(): void {
    this.currentLevelId = null;
  }

  // 获取所有关卡
  getAllLevels(): LevelConfig[] {
    return Array.from(this.levels.values());
  }
}

interface GameState {
  playerPosition: { x: number; y: number };
  playerReachedTargets: string[];
  collectedItems: string[];
  elapsedTime: number;
  playerCollidedWithObstacles: boolean;
}

describe('关卡系统测试', () => {
  let levelManager: LevelManager;

  beforeEach(() => {
    levelManager = new LevelManager();
  });

  describe('关卡加载', () => {
    it('UT-LVL-001: 应该正确加载有效的关卡配置', () => {
      const levelConfig: LevelConfig = {
        id: 'level-1',
        name: '第一关',
        difficulty: 1,
        objects: [
          {
            id: 'player',
            type: 'player',
            position: { x: 0, y: 0 },
            properties: {}
          },
          {
            id: 'target',
            type: 'target',
            position: { x: 10, y: 10 },
            properties: {}
          }
        ],
        winConditions: [
          { type: 'reach_target', targetId: 'target' }
        ],
        loseConditions: [
          { type: 'fall_out', threshold: -50 }
        ]
      };

      expect(() => {
        levelManager.loadLevel(levelConfig);
      }).not.toThrow();

      const loaded = levelManager.getLevel('level-1');
      expect(loaded).toBeDefined();
      expect(loaded!.name).toBe('第一关');
    });

    it('UT-LVL-002: 应该拒绝无效的关卡配置', () => {
      const invalidConfig: any = {
        id: '', // 空 ID
        name: '测试',
        difficulty: 1,
        objects: [],
        winConditions: [],
        loseConditions: []
      };

      expect(() => {
        levelManager.loadLevel(invalidConfig);
      }).toThrow();
    });

    it('应该拒绝难度超出范围的关卡', () => {
      const invalidConfig: LevelConfig = {
        id: 'level-invalid',
        name: '测试',
        difficulty: 10, // 超出 1-5 范围
        objects: [{ id: 'obj', type: 'player', position: { x: 0, y: 0 }, properties: {} }],
        winConditions: [{ type: 'reach_target' }],
        loseConditions: []
      };

      expect(() => {
        levelManager.loadLevel(invalidConfig);
      }).toThrow();
    });

    it('validateLevel 应该正确验证关卡', () => {
      const validConfig: LevelConfig = {
        id: 'level-valid',
        name: '有效关卡',
        difficulty: 3,
        objects: [{ id: 'obj', type: 'player', position: { x: 0, y: 0 }, properties: {} }],
        winConditions: [{ type: 'reach_target' }],
        loseConditions: []
      };

      expect(levelManager.validateLevel(validConfig)).toBe(true);
    });
  });

  describe('关卡切换', () => {
    beforeEach(() => {
      levelManager.loadLevel({
        id: 'level-1',
        name: '第一关',
        difficulty: 1,
        objects: [{ id: 'obj', type: 'player', position: { x: 0, y: 0 }, properties: {} }],
        winConditions: [{ type: 'reach_target' }],
        loseConditions: []
      });
      levelManager.loadLevel({
        id: 'level-2',
        name: '第二关',
        difficulty: 2,
        objects: [{ id: 'obj', type: 'player', position: { x: 0, y: 0 }, properties: {} }],
        winConditions: [{ type: 'reach_target' }],
        loseConditions: []
      });
    });

    it('UT-LVL-003: 应该正确设置当前关卡', () => {
      const success = levelManager.setCurrentLevel('level-1');
      expect(success).toBe(true);
      expect(levelManager.getCurrentLevelId()).toBe('level-1');
    });

    it('设置不存在的关卡应该失败', () => {
      const success = levelManager.setCurrentLevel('non-existent');
      expect(success).toBe(false);
    });

    it('UT-LVL-005: 应该正确重置关卡', () => {
      levelManager.setCurrentLevel('level-1');
      expect(levelManager.getCurrentLevelId()).toBe('level-1');

      levelManager.resetLevel();
      expect(levelManager.getCurrentLevelId()).toBe(null);
    });
  });

  describe('胜利条件检测', () => {
    beforeEach(() => {
      levelManager.loadLevel({
        id: 'level-test',
        name: '测试关卡',
        difficulty: 1,
        objects: [
          { id: 'player', type: 'player', position: { x: 0, y: 0 }, properties: {} },
          { id: 'target-1', type: 'target', position: { x: 10, y: 10 }, properties: {} },
          { id: 'target-2', type: 'target', position: { x: 20, y: 20 }, properties: {} }
        ],
        winConditions: [
          { type: 'reach_target', targetId: 'target-1' },
          { type: 'collect_all', count: 3 }
        ],
        loseConditions: [
          { type: 'fall_out', threshold: -50 }
        ]
      });
      levelManager.setCurrentLevel('level-test');
    });

    it('UT-LVL-003: 满足所有胜利条件时应该返回胜利', () => {
      const gameState: GameState = {
        playerPosition: { x: 10, y: 10 },
        playerReachedTargets: ['target-1'],
        collectedItems: ['item-1', 'item-2', 'item-3'],
        elapsedTime: 100,
        playerCollidedWithObstacles: false
      };

      expect(levelManager.checkWinCondition(gameState)).toBe(true);
    });

    it('不满足胜利条件时应该返回失败', () => {
      const gameState: GameState = {
        playerPosition: { x: 0, y: 0 },
        playerReachedTargets: [],
        collectedItems: ['item-1'],
        elapsedTime: 100,
        playerCollidedWithObstacles: false
      };

      expect(levelManager.checkWinCondition(gameState)).toBe(false);
    });
  });

  describe('失败条件检测', () => {
    beforeEach(() => {
      levelManager.loadLevel({
        id: 'level-test',
        name: '测试关卡',
        difficulty: 1,
        objects: [{ id: 'player', type: 'player', position: { x: 0, y: 0 }, properties: {} }],
        winConditions: [{ type: 'reach_target' }],
        loseConditions: [
          { type: 'fall_out', threshold: -50 },
          { type: 'time_out', threshold: 300 },
          { type: 'collision' }
        ]
      });
      levelManager.setCurrentLevel('level-test');
    });

    it('UT-LVL-004: 触发失败条件时应该返回失败', () => {
      const gameState: GameState = {
        playerPosition: { x: 0, y: -100 }, // 掉出边界
        playerReachedTargets: [],
        collectedItems: [],
        elapsedTime: 100,
        playerCollidedWithObstacles: false
      };

      expect(levelManager.checkLoseCondition(gameState)).toBe(true);
    });

    it('时间超时应该触发失败', () => {
      const gameState: GameState = {
        playerPosition: { x: 0, y: 0 },
        playerReachedTargets: [],
        collectedItems: [],
        elapsedTime: 400, // 超过 300 秒
        playerCollidedWithObstacles: false
      };

      expect(levelManager.checkLoseCondition(gameState)).toBe(true);
    });

    it('未触发失败条件时应该返回 false', () => {
      const gameState: GameState = {
        playerPosition: { x: 0, y: 0 },
        playerReachedTargets: [],
        collectedItems: [],
        elapsedTime: 100,
        playerCollidedWithObstacles: false
      };

      expect(levelManager.checkLoseCondition(gameState)).toBe(false);
    });
  });

  describe('进度管理', () => {
    it('UT-LVL-006: 应该正确保存和加载进度', () => {
      const progress: LevelProgress = {
        levelId: 'level-1',
        stars: 3,
        bestTime: 120,
        completed: true,
        unlocked: true
      };

      levelManager.saveProgress(progress);
      const loaded = levelManager.getProgress('level-1');

      expect(loaded).toBeDefined();
      expect(loaded!.stars).toBe(3);
      expect(loaded!.bestTime).toBe(120);
      expect(loaded!.completed).toBe(true);
    });

    it('UT-LVL-006: 应该正确解锁下一关', () => {
      // 先加载两个关卡
      levelManager.loadLevel({
        id: 'level-1',
        name: '第一关',
        difficulty: 1,
        objects: [{ id: 'obj', type: 'player', position: { x: 0, y: 0 }, properties: {} }],
        winConditions: [{ type: 'reach_target' }],
        loseConditions: []
      });
      levelManager.loadLevel({
        id: 'level-2',
        name: '第二关',
        difficulty: 2,
        objects: [{ id: 'obj', type: 'player', position: { x: 0, y: 0 }, properties: {} }],
        winConditions: [{ type: 'reach_target' }],
        loseConditions: []
      });

      // 初始时第二关未解锁
      let progress = levelManager.getProgress('level-2');
      expect(progress?.unlocked).toBeFalsy();

      // 解锁下一关
      levelManager.unlockNextLevel('level-1');

      // 验证第二关已解锁
      progress = levelManager.getProgress('level-2');
      expect(progress?.unlocked).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该处理空关卡列表', () => {
      const levels = levelManager.getAllLevels();
      expect(levels.length).toBe(0);
    });

    it('应该处理未设置当前关卡的情况', () => {
      expect(levelManager.getCurrentLevelId()).toBe(null);
      expect(levelManager.checkWinCondition({
        playerPosition: { x: 0, y: 0 },
        playerReachedTargets: [],
        collectedItems: [],
        elapsedTime: 0,
        playerCollidedWithObstacles: false
      })).toBe(false);
    });

    it('获取不存在的进度应该返回 undefined', () => {
      const progress = levelManager.getProgress('non-existent');
      expect(progress).toBeUndefined();
    });
  });
});
