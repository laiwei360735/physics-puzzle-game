/**
 * 关卡管理系统
 * 负责关卡数据的加载、解析和管理
 */

import Phaser from 'phaser';

export interface LevelData {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  player: {
    x: number;
    y: number;
    type?: string;
  };
  obstacles: Array<{
    x: number;
    y: number;
    type: 'static' | 'dynamic' | 'moving' | 'rotating';
    shape: 'rectangle' | 'circle' | 'triangle' | 'polygon';
    width?: number;
    height?: number;
    radius?: number;
    sides?: number;
    color?: number;
    moveRange?: number;
    moveSpeed?: number;
    moveAxis?: 'x' | 'y';
    rotationSpeed?: number;
  }>;
  goals: Array<{
    x: number;
    y: number;
    radius?: number;
    type?: 'normal' | 'star' | 'bonus';
  }>;
  timeLimit?: number;
  targetScore?: number;
}

export class LevelManager {
  private currentLevelId: number = 1;
  private levels: Map<number, LevelData> = new Map();
  private unlockedLevels: number = 1;

  constructor() {
    this.initializeLevels();
  }

  /**
   * 初始化关卡数据
   * 包含 3 关新手教程 + 20 关正式关卡
   */
  private initializeLevels(): void {
    // ============ 新手教程关卡 ============
    
    // 教程关卡 -1: 点击拖拽教学
    const tutorialLevel1: LevelData = {
      id: -1,
      name: '教程 1: 拖拽',
      difficulty: 'easy',
      player: { x: 150, y: 500 },
      obstacles: [],
      goals: [{ x: 700, y: 500, radius: 40, type: 'normal' }],
    };
    this.levels.set(-1, tutorialLevel1);

    // 教程关卡 -2: 切割绳子教学
    const tutorialLevel2: LevelData = {
      id: -2,
      name: '教程 2: 物理',
      difficulty: 'easy',
      player: { x: 100, y: 200 },
      obstacles: [
        {
          x: 400,
          y: 550,
          type: 'static',
          shape: 'rectangle',
          width: 300,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [{ x: 400, y: 500, radius: 40, type: 'normal' }],
    };
    this.levels.set(-2, tutorialLevel2);

    // 教程关卡 -3: 综合练习
    const tutorialLevel3: LevelData = {
      id: -3,
      name: '教程 3: 练习',
      difficulty: 'easy',
      player: { x: 100, y: 300 },
      obstacles: [
        {
          x: 300,
          y: 450,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
        {
          x: 550,
          y: 380,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [{ x: 700, y: 500, radius: 40, type: 'normal' }],
    };
    this.levels.set(-3, tutorialLevel3);

    // ============ 正式关卡 ============
    
    const level1: LevelData = {
      id: 1,
      name: '入门',
      difficulty: 'easy',
      player: { x: 100, y: 400 },
      obstacles: [
        {
          x: 400,
          y: 450,
          type: 'static',
          shape: 'rectangle',
          width: 200,
          height: 20,
          color: 0x888888,
        },
        {
          x: 600,
          y: 350,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 150,
          color: 0x884444,
        },
      ],
      goals: [
        { x: 700, y: 300, type: 'normal' },
      ],
      timeLimit: 60,
      targetScore: 100,
    };

    const level2: LevelData = {
      id: 2,
      name: '移动平台',
      difficulty: 'easy',
      player: { x: 100, y: 400 },
      obstacles: [
        {
          x: 300,
          y: 400,
          type: 'moving',
          shape: 'rectangle',
          width: 150,
          height: 20,
          moveRange: 100,
          moveSpeed: 2,
          moveAxis: 'x',
        },
        {
          x: 600,
          y: 300,
          type: 'static',
          shape: 'rectangle',
          width: 100,
          height: 20,
        },
      ],
      goals: [
        { x: 700, y: 250, type: 'normal' },
        { x: 500, y: 200, type: 'star' },
      ],
      timeLimit: 90,
      targetScore: 200,
    };

    const level3: LevelData = {
      id: 3,
      name: '旋转挑战',
      difficulty: 'medium',
      player: { x: 100, y: 400 },
      obstacles: [
        {
          x: 400,
          y: 350,
          type: 'rotating',
          shape: 'rectangle',
          width: 200,
          height: 20,
          rotationSpeed: 2,
        },
        {
          x: 600,
          y: 400,
          type: 'moving',
          shape: 'rectangle',
          width: 100,
          height: 20,
          moveRange: 80,
          moveSpeed: 3,
          moveAxis: 'y',
        },
      ],
      goals: [
        { x: 700, y: 200, type: 'normal' },
        { x: 300, y: 150, type: 'star' },
        { x: 500, y: 100, type: 'bonus' },
      ],
      timeLimit: 120,
      targetScore: 300,
    };

    this.levels.set(1, level1);
    this.levels.set(2, level2);
    this.levels.set(3, level3);
  }

  /**
   * 获取关卡数据
   */
  getLevel(levelId: number): LevelData | null {
    // 支持新手教程关卡（负数 ID）
    if (levelId < 0) {
      return this.levels.get(levelId) || null;
    }
    return this.levels.get(levelId) || null;
  }

  /**
   * 检查是否是教程关卡
   */
  isTutorialLevel(levelId: number): boolean {
    return levelId < 0;
  }

  /**
   * 获取当前关卡
   */
  getCurrentLevel(): LevelData | null {
    return this.getLevel(this.currentLevelId);
  }

  /**
   * 设置当前关卡
   */
  setCurrentLevel(levelId: number): void {
    if (this.levels.has(levelId)) {
      this.currentLevelId = levelId;
    }
  }

  /**
   * 检查关卡是否解锁
   */
  isLevelUnlocked(levelId: number): boolean {
    return levelId <= this.unlockedLevels;
  }

  /**
   * 解锁下一关
   */
  unlockNextLevel(): void {
    if (this.currentLevelId >= this.unlockedLevels) {
      this.unlockedLevels = this.currentLevelId + 1;
    }
  }

  /**
   * 获取总关卡数
   */
  getTotalLevels(): number {
    return this.levels.size;
  }

  /**
   * 获取所有关卡列表
   */
  getAllLevels(): LevelData[] {
    return Array.from(this.levels.values());
  }

  /**
   * 重置关卡进度
   */
  resetProgress(): void {
    this.currentLevelId = 1;
    this.unlockedLevels = 1;
  }

  /**
   * 保存进度（本地存储）
   */
  saveProgress(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('unlockedLevels', this.unlockedLevels.toString());
      localStorage.setItem('currentLevel', this.currentLevelId.toString());
    }
  }

  /**
   * 加载进度（本地存储）
   */
  loadProgress(): void {
    if (typeof localStorage !== 'undefined') {
      const unlocked = localStorage.getItem('unlockedLevels');
      const current = localStorage.getItem('currentLevel');
      
      if (unlocked) {
        this.unlockedLevels = parseInt(unlocked, 10);
      }
      if (current) {
        this.currentLevelId = parseInt(current, 10);
      }
    }
  }
}

// 导出单例
export const levelManager = new LevelManager();
