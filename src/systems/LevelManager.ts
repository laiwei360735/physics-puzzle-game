/**
 * 关卡管理系统
 * 负责关卡数据的加载、解析和管理
 * 包含完整的 20 关数据，每关引入新元素
 */

import Phaser from 'phaser';

export interface LevelData {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starRating: number; // 1-3 星难度评级
  player: {
    x: number;
    y: number;
    type?: string;
  };
  obstacles: Array<{
    x: number;
    y: number;
    type: 'static' | 'dynamic' | 'moving' | 'rotating' | 'rope' | 'fan' | 'spring' | 'magnet';
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
    // 新元素属性
    ropeLength?: number;
    ropeAnchorX?: number;
    ropeAnchorY?: number;
    fanStrength?: number;
    fanDirection?: 'up' | 'down' | 'left' | 'right';
    springStrength?: number;
    magnetStrength?: number;
    magnetPolarity?: 'attract' | 'repel';
  }>;
  goals: Array<{
    x: number;
    y: number;
    radius?: number;
    type?: 'normal' | 'star' | 'bonus';
  }>;
  timeLimit?: number;
  targetScore?: number;
  // 三星评价标准
  starCriteria?: {
    oneStar: { minScore: number };
    twoStars: { minScore: number; collectStars?: number };
    threeStars: { minScore: number; collectStars?: number; maxMoves?: number };
  };
}

export interface StarProgress {
  level: number;
  stars: number; // 1-3
  bestScore: number;
  collectedStars: number; // 收集的星星数量
  moves: number;
  completed: boolean;
}

export class LevelManager {
  private currentLevelId: number = 1;
  private levels: Map<number, LevelData> = new Map();
  private unlockedLevels: number = 1;
  private starProgress: Map<number, StarProgress> = new Map(); // 星级进度保存

  constructor() {
    this.initializeLevels();
    this.loadStarProgress();
  }

  /**
   * 初始化关卡数据
   * 包含 3 关新手教程 + 20 关正式关卡
   * 根据 GAME_DESIGN.md 和 level-review-1.md 设计
   */
  private initializeLevels(): void {
    // ============ 新手教程关卡 ============
    
    // 教程关卡 -1: 点击拖拽教学
    const tutorialLevel1: LevelData = {
      id: -1,
      name: '教程 1: 拖拽',
      difficulty: 'easy',
      starRating: 1,
      player: { x: 150, y: 500 },
      obstacles: [],
      goals: [{ x: 700, y: 500, radius: 40, type: 'normal' }],
      starCriteria: {
        oneStar: { minScore: 50 },
        twoStars: { minScore: 80 },
        threeStars: { minScore: 100, maxMoves: 1 },
      },
    };
    this.levels.set(-1, tutorialLevel1);

    // 教程关卡 -2: 切割绳子教学
    const tutorialLevel2: LevelData = {
      id: -2,
      name: '教程 2: 物理',
      difficulty: 'easy',
      starRating: 1,
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
      starCriteria: {
        oneStar: { minScore: 50 },
        twoStars: { minScore: 80 },
        threeStars: { minScore: 100, maxMoves: 1 },
      },
    };
    this.levels.set(-2, tutorialLevel2);

    // 教程关卡 -3: 综合练习
    const tutorialLevel3: LevelData = {
      id: -3,
      name: '教程 3: 练习',
      difficulty: 'easy',
      starRating: 1,
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
      starCriteria: {
        oneStar: { minScore: 50 },
        twoStars: { minScore: 80 },
        threeStars: { minScore: 100, maxMoves: 2 },
      },
    };
    this.levels.set(-3, tutorialLevel3);

    // ============ 正式关卡 1-20 ============
    // 根据 GAME_DESIGN.md 和 level-review-1.md 设计
    // 难度曲线已根据评审报告优化调整

    // --- 第 1 世界：森林实验室 (关卡 1-20) ---

    // 关卡 1: 初次见面 - 基础切割操作
    const level1: LevelData = {
      id: 1,
      name: '初次见面',
      difficulty: 'easy',
      starRating: 1,
      player: { x: 400, y: 200 }, // 糖果悬挂
      obstacles: [
        {
          x: 400,
          y: 100,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 100,
          ropeLength: 100,
          ropeAnchorX: 400,
          ropeAnchorY: 100,
        },
      ],
      goals: [
        { x: 400, y: 550, radius: 50, type: 'normal' }, // 青蛙嘴巴
      ],
      timeLimit: 60,
      targetScore: 100,
      starCriteria: {
        oneStar: { minScore: 50 },
        twoStars: { minScore: 80 },
        threeStars: { minScore: 100, maxMoves: 1 }, // 一刀完成
      },
    };

    // 关卡 2: 重力朋友 - 理解重力方向
    const level2: LevelData = {
      id: 2,
      name: '重力朋友',
      difficulty: 'easy',
      starRating: 1,
      player: { x: 200, y: 150 },
      obstacles: [
        {
          x: 400,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 300,
          height: 20,
          color: 0x888888,
        },
        {
          x: 650,
          y: 350,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 100,
          color: 0x884444,
        },
      ],
      goals: [
        { x: 700, y: 300, type: 'normal' },
      ],
      timeLimit: 60,
      targetScore: 150,
      starCriteria: {
        oneStar: { minScore: 80 },
        twoStars: { minScore: 120 },
        threeStars: { minScore: 150, maxMoves: 2 },
      },
    };

    // 关卡 3: 摇摆糖果 - 时机把握
    const level3: LevelData = {
      id: 3,
      name: '摇摆糖果',
      difficulty: 'easy',
      starRating: 2,
      player: { x: 300, y: 180 },
      obstacles: [
        {
          x: 300,
          y: 80,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 100,
          ropeLength: 100,
          ropeAnchorX: 300,
          ropeAnchorY: 80,
        },
        {
          x: 600,
          y: 450,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 700, y: 400, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 200,
      starCriteria: {
        oneStar: { minScore: 100 },
        twoStars: { minScore: 150 },
        threeStars: { minScore: 200, maxMoves: 1 },
      },
    };

    // 关卡 4: 双绳挑战 - 多步规划
    const level4: LevelData = {
      id: 4,
      name: '双绳挑战',
      difficulty: 'easy',
      starRating: 2,
      player: { x: 250, y: 200 },
      obstacles: [
        {
          x: 250,
          y: 100,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 100,
          ropeLength: 100,
          ropeAnchorX: 250,
          ropeAnchorY: 100,
        },
        {
          x: 450,
          y: 150,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 50,
          ropeLength: 50,
          ropeAnchorX: 450,
          ropeAnchorY: 150,
        },
      ],
      goals: [
        { x: 350, y: 500, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 250,
      starCriteria: {
        oneStar: { minScore: 120 },
        twoStars: { minScore: 180 },
        threeStars: { minScore: 250, maxMoves: 2 },
      },
    };

    // 关卡 5: BOSS 关 - 糖果雨 (根据评审报告降低难度，移除风扇)
    const level5: LevelData = {
      id: 5,
      name: '糖果雨',
      difficulty: 'medium',
      starRating: 2, // 根据评审报告从★★★降为★★☆
      player: { x: 300, y: 200 },
      obstacles: [
        {
          x: 250,
          y: 100,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 100,
          ropeLength: 100,
          ropeAnchorX: 250,
          ropeAnchorY: 100,
        },
        {
          x: 450,
          y: 120,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 80,
          ropeLength: 80,
          ropeAnchorX: 450,
          ropeAnchorY: 120,
        },
        {
          x: 400,
          y: 500,
          type: 'static',
          shape: 'rectangle',
          width: 200,
          height: 30,
          color: 0x448844,
        },
      ],
      goals: [
        { x: 350, y: 480, type: 'normal' },
        { x: 450, y: 480, type: 'normal' },
      ],
      timeLimit: 120,
      targetScore: 300,
      starCriteria: {
        oneStar: { minScore: 150 },
        twoStars: { minScore: 220, collectStars: 1 },
        threeStars: { minScore: 300, collectStars: 2, maxMoves: 3 },
      },
    };

    // 关卡 6: 弹跳球 - 反弹机制
    const level6: LevelData = {
      id: 6,
      name: '弹跳球',
      difficulty: 'easy',
      starRating: 2,
      player: { x: 150, y: 200 },
      obstacles: [
        {
          x: 350,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 200,
          height: 20,
          color: 0x888888,
        },
        {
          x: 600,
          y: 300,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 150,
          color: 0x884444,
        },
        {
          x: 500,
          y: 450,
          type: 'spring',
          shape: 'rectangle',
          width: 80,
          height: 20,
          color: 0x4488cc,
          springStrength: 1.5,
        },
      ],
      goals: [
        { x: 700, y: 250, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 250,
      starCriteria: {
        oneStar: { minScore: 120 },
        twoStars: { minScore: 180 },
        threeStars: { minScore: 250, maxMoves: 2 },
      },
    };

    // 关卡 7: 多米诺 - 连锁反应
    const level7: LevelData = {
      id: 7,
      name: '多米诺',
      difficulty: 'easy',
      starRating: 2,
      player: { x: 100, y: 250 },
      obstacles: [
        {
          x: 250,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 30,
          height: 80,
          color: 0x884444,
        },
        {
          x: 320,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 30,
          height: 80,
          color: 0x884444,
        },
        {
          x: 390,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 30,
          height: 80,
          color: 0x884444,
        },
        {
          x: 500,
          y: 450,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 700, y: 400, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 300,
      starCriteria: {
        oneStar: { minScore: 150 },
        twoStars: { minScore: 220 },
        threeStars: { minScore: 300, maxMoves: 1 },
      },
    };

    // 关卡 8: 保护罩 - 规避危险
    const level8: LevelData = {
      id: 8,
      name: '保护罩',
      difficulty: 'easy',
      starRating: 2,
      player: { x: 200, y: 200 },
      obstacles: [
        {
          x: 400,
          y: 450,
          type: 'static',
          shape: 'rectangle',
          width: 300,
          height: 20,
          color: 0x888888,
        },
        {
          x: 350,
          y: 430,
          type: 'static',
          shape: 'triangle',
          width: 40,
          height: 40,
          color: 0xff0000, // 危险尖刺
        },
        {
          x: 450,
          y: 430,
          type: 'static',
          shape: 'triangle',
          width: 40,
          height: 40,
          color: 0xff0000,
        },
      ],
      goals: [
        { x: 600, y: 400, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 250,
      starCriteria: {
        oneStar: { minScore: 120 },
        twoStars: { minScore: 180 },
        threeStars: { minScore: 250, maxMoves: 2 },
      },
    };

    // 关卡 9: 收集星星 - 多目标处理
    const level9: LevelData = {
      id: 9,
      name: '收集星星',
      difficulty: 'easy',
      starRating: 2,
      player: { x: 150, y: 200 },
      obstacles: [
        {
          x: 300,
          y: 350,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
        {
          x: 550,
          y: 280,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 700, y: 450, type: 'normal' },
        { x: 350, y: 300, type: 'star' },
        { x: 600, y: 230, type: 'star' },
        { x: 450, y: 400, type: 'star' },
      ],
      timeLimit: 120,
      targetScore: 350,
      starCriteria: {
        oneStar: { minScore: 150 },
        twoStars: { minScore: 250, collectStars: 2 },
        threeStars: { minScore: 350, collectStars: 3, maxMoves: 3 },
      },
    };

    // 关卡 10: BOSS 关 - 精准送达
    const level10: LevelData = {
      id: 10,
      name: '精准送达',
      difficulty: 'medium',
      starRating: 3,
      player: { x: 200, y: 180 },
      obstacles: [
        {
          x: 200,
          y: 80,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 100,
          ropeLength: 100,
          ropeAnchorX: 200,
          ropeAnchorY: 80,
        },
        {
          x: 400,
          y: 350,
          type: 'moving',
          shape: 'rectangle',
          width: 120,
          height: 20,
          moveRange: 100,
          moveSpeed: 2,
          moveAxis: 'x',
          color: 0x888888,
        },
        {
          x: 600,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 100,
          color: 0x884444,
        },
      ],
      goals: [
        { x: 700, y: 350, type: 'normal' },
        { x: 300, y: 250, type: 'star' },
        { x: 500, y: 200, type: 'star' },
        { x: 650, y: 300, type: 'star' },
      ],
      timeLimit: 120,
      targetScore: 400,
      starCriteria: {
        oneStar: { minScore: 200 },
        twoStars: { minScore: 300, collectStars: 2 },
        threeStars: { minScore: 400, collectStars: 3, maxMoves: 4 },
      },
    };

    // 关卡 11: 微风轻拂 - 风力引入 (根据评审报告降低难度)
    const level11: LevelData = {
      id: 11,
      name: '微风轻拂',
      difficulty: 'easy',
      starRating: 2, // 根据评审报告从★★★降为★★☆
      player: { x: 150, y: 250 },
      obstacles: [
        {
          x: 100,
          y: 400,
          type: 'fan',
          shape: 'rectangle',
          width: 60,
          height: 40,
          color: 0x44cc88,
          fanStrength: 0.5, // 弱风
          fanDirection: 'right',
        },
        {
          x: 500,
          y: 350,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 700, y: 300, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 300,
      starCriteria: {
        oneStar: { minScore: 150 },
        twoStars: { minScore: 220 },
        threeStars: { minScore: 300, maxMoves: 2 },
      },
    };

    // 关卡 12: 逆风而行 - 强风 + 精准
    const level12: LevelData = {
      id: 12,
      name: '逆风而行',
      difficulty: 'medium',
      starRating: 3,
      player: { x: 200, y: 250 },
      obstacles: [
        {
          x: 100,
          y: 400,
          type: 'fan',
          shape: 'rectangle',
          width: 80,
          height: 50,
          color: 0x44cc88,
          fanStrength: 1.2, // 强风
          fanDirection: 'right',
        },
        {
          x: 400,
          y: 300,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 150,
          color: 0x884444,
        },
        {
          x: 600,
          y: 350,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 700, y: 300, type: 'normal' },
        { x: 500, y: 200, type: 'star' },
      ],
      timeLimit: 120,
      targetScore: 350,
      starCriteria: {
        oneStar: { minScore: 180 },
        twoStars: { minScore: 260, collectStars: 1 },
        threeStars: { minScore: 350, collectStars: 1, maxMoves: 3 },
      },
    };

    // 关卡 13: 弹簧床 - 弹性装置
    const level13: LevelData = {
      id: 13,
      name: '弹簧床',
      difficulty: 'medium',
      starRating: 3,
      player: { x: 150, y: 350 },
      obstacles: [
        {
          x: 350,
          y: 450,
          type: 'spring',
          shape: 'rectangle',
          width: 100,
          height: 25,
          color: 0x4488cc,
          springStrength: 2.0,
        },
        {
          x: 600,
          y: 300,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
        {
          x: 550,
          y: 250,
          type: 'static',
          shape: 'triangle',
          width: 40,
          height: 40,
          color: 0xff0000,
        },
      ],
      goals: [
        { x: 700, y: 250, type: 'normal' },
        { x: 400, y: 200, type: 'star' },
      ],
      timeLimit: 90,
      targetScore: 350,
      starCriteria: {
        oneStar: { minScore: 180 },
        twoStars: { minScore: 260, collectStars: 1 },
        threeStars: { minScore: 350, collectStars: 1, maxMoves: 2 },
      },
    };

    // 关卡 14: 连环跳 - 多弹簧
    const level14: LevelData = {
      id: 14,
      name: '连环跳',
      difficulty: 'medium',
      starRating: 3,
      player: { x: 100, y: 400 },
      obstacles: [
        {
          x: 250,
          y: 450,
          type: 'spring',
          shape: 'rectangle',
          width: 80,
          height: 25,
          color: 0x4488cc,
          springStrength: 1.8,
        },
        {
          x: 450,
          y: 400,
          type: 'spring',
          shape: 'rectangle',
          width: 80,
          height: 25,
          color: 0x4488cc,
          springStrength: 1.8,
        },
        {
          x: 650,
          y: 350,
          type: 'static',
          shape: 'rectangle',
          width: 120,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 750, y: 300, type: 'normal' },
        { x: 350, y: 250, type: 'star' },
        { x: 550, y: 200, type: 'star' },
      ],
      timeLimit: 120,
      targetScore: 400,
      starCriteria: {
        oneStar: { minScore: 200 },
        twoStars: { minScore: 300, collectStars: 2 },
        threeStars: { minScore: 400, collectStars: 2, maxMoves: 3 },
      },
    };

    // 关卡 15: BOSS 关 - 风之舞 (根据评审报告降低难度，移除收集元素)
    const level15: LevelData = {
      id: 15,
      name: '风之舞',
      difficulty: 'medium',
      starRating: 3, // 根据评审报告从★★★★降为★★★☆
      player: { x: 150, y: 300 },
      obstacles: [
        {
          x: 100,
          y: 450,
          type: 'fan',
          shape: 'rectangle',
          width: 80,
          height: 50,
          color: 0x44cc88,
          fanStrength: 1.0,
          fanDirection: 'up',
        },
        {
          x: 400,
          y: 450,
          type: 'spring',
          shape: 'rectangle',
          width: 100,
          height: 25,
          color: 0x4488cc,
          springStrength: 1.8,
        },
        {
          x: 600,
          y: 350,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
        {
          x: 500,
          y: 250,
          type: 'static',
          shape: 'triangle',
          width: 40,
          height: 40,
          color: 0xff0000,
        },
      ],
      goals: [
        { x: 700, y: 300, type: 'normal' },
      ],
      timeLimit: 120,
      targetScore: 400,
      starCriteria: {
        oneStar: { minScore: 200 },
        twoStars: { minScore: 300 },
        threeStars: { minScore: 400, maxMoves: 4 },
      },
    };

    // 关卡 16: 磁铁吸引 - 磁力概念
    const level16: LevelData = {
      id: 16,
      name: '磁铁吸引',
      difficulty: 'medium',
      starRating: 3,
      player: { x: 200, y: 300 },
      obstacles: [
        {
          x: 600,
          y: 300,
          type: 'magnet',
          shape: 'circle',
          radius: 40,
          color: 0x8844cc,
          magnetStrength: 0.8,
          magnetPolarity: 'attract',
        },
        {
          x: 400,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 200,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 650, y: 300, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 350,
      starCriteria: {
        oneStar: { minScore: 180 },
        twoStars: { minScore: 260 },
        threeStars: { minScore: 350, maxMoves: 2 },
      },
    };

    // 关卡 17: 磁铁排斥 - 极性理解
    const level17: LevelData = {
      id: 17,
      name: '磁铁排斥',
      difficulty: 'medium',
      starRating: 3,
      player: { x: 200, y: 300 },
      obstacles: [
        {
          x: 500,
          y: 300,
          type: 'magnet',
          shape: 'circle',
          radius: 40,
          color: 0x8844cc,
          magnetStrength: 1.0,
          magnetPolarity: 'repel',
        },
        {
          x: 700,
          y: 300,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 150,
          color: 0x884444,
        },
        {
          x: 600,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 150,
          height: 20,
          color: 0x888888,
        },
      ],
      goals: [
        { x: 750, y: 350, type: 'normal' },
      ],
      timeLimit: 90,
      targetScore: 350,
      starCriteria: {
        oneStar: { minScore: 180 },
        twoStars: { minScore: 260 },
        threeStars: { minScore: 350, maxMoves: 2 },
      },
    };

    // 关卡 18: 磁性迷宫 - 磁力导航
    const level18: LevelData = {
      id: 18,
      name: '磁性迷宫',
      difficulty: 'hard',
      starRating: 4,
      player: { x: 100, y: 300 },
      obstacles: [
        {
          x: 300,
          y: 250,
          type: 'magnet',
          shape: 'circle',
          radius: 35,
          color: 0x8844cc,
          magnetStrength: 0.6,
          magnetPolarity: 'attract',
        },
        {
          x: 500,
          y: 350,
          type: 'magnet',
          shape: 'circle',
          radius: 35,
          color: 0x8844cc,
          magnetStrength: 0.6,
          magnetPolarity: 'repel',
        },
        {
          x: 400,
          y: 200,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 100,
          color: 0x884444,
        },
        {
          x: 600,
          y: 400,
          type: 'static',
          shape: 'rectangle',
          width: 20,
          height: 100,
          color: 0x884444,
        },
      ],
      goals: [
        { x: 700, y: 300, type: 'normal' },
        { x: 350, y: 350, type: 'star' },
      ],
      timeLimit: 120,
      targetScore: 400,
      starCriteria: {
        oneStar: { minScore: 200 },
        twoStars: { minScore: 300, collectStars: 1 },
        threeStars: { minScore: 400, collectStars: 1, maxMoves: 3 },
      },
    };

    // 关卡 19: 磁力实验 - 三元素组合 (根据评审报告明确元素)
    const level19: LevelData = {
      id: 19,
      name: '磁力实验',
      difficulty: 'hard',
      starRating: 4, // 根据评审报告明确为三元素组合
      player: { x: 150, y: 350 },
      obstacles: [
        {
          x: 400,
          y: 300,
          type: 'magnet',
          shape: 'circle',
          radius: 40,
          color: 0x8844cc,
          magnetStrength: 0.7,
          magnetPolarity: 'attract',
        },
        {
          x: 200,
          y: 450,
          type: 'fan',
          shape: 'rectangle',
          width: 80,
          height: 50,
          color: 0x44cc88,
          fanStrength: 0.8,
          fanDirection: 'up',
        },
        {
          x: 600,
          y: 450,
          type: 'spring',
          shape: 'rectangle',
          width: 100,
          height: 25,
          color: 0x4488cc,
          springStrength: 1.5,
        },
        {
          x: 500,
          y: 200,
          type: 'static',
          shape: 'triangle',
          width: 40,
          height: 40,
          color: 0xff0000,
        },
      ],
      goals: [
        { x: 700, y: 400, type: 'normal' },
        { x: 300, y: 200, type: 'star' },
      ],
      timeLimit: 150,
      targetScore: 450,
      starCriteria: {
        oneStar: { minScore: 220 },
        twoStars: { minScore: 330, collectStars: 1 },
        threeStars: { minScore: 450, collectStars: 1, maxMoves: 4 },
      },
    };

    // 关卡 20: 世界 BOSS - 终极挑战 (根据评审报告补充完整设计)
    const level20: LevelData = {
      id: 20,
      name: '终极挑战',
      difficulty: 'hard',
      starRating: 4, // 根据评审报告从★★★★★降为★★★★☆
      player: { x: 400, y: 150 },
      obstacles: [
        // 旋转平台 (用移动障碍物模拟)
        {
          x: 400,
          y: 400,
          type: 'rotating',
          shape: 'rectangle',
          width: 300,
          height: 30,
          color: 0x666666,
          rotationSpeed: 1,
        },
        // 绳子
        {
          x: 200,
          y: 100,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 50,
          ropeLength: 50,
          ropeAnchorX: 200,
          ropeAnchorY: 100,
        },
        {
          x: 600,
          y: 100,
          type: 'rope',
          shape: 'rectangle',
          width: 5,
          height: 50,
          ropeLength: 50,
          ropeAnchorX: 600,
          ropeAnchorY: 100,
        },
        // 风扇
        {
          x: 100,
          y: 450,
          type: 'fan',
          shape: 'rectangle',
          width: 80,
          height: 50,
          color: 0x44cc88,
          fanStrength: 0.8,
          fanDirection: 'up',
        },
        // 弹簧
        {
          x: 700,
          y: 450,
          type: 'spring',
          shape: 'rectangle',
          width: 80,
          height: 25,
          color: 0x4488cc,
          springStrength: 1.5,
        },
        // 危险障碍
        {
          x: 350,
          y: 380,
          type: 'static',
          shape: 'triangle',
          width: 30,
          height: 30,
          color: 0xff0000,
        },
        {
          x: 450,
          y: 380,
          type: 'static',
          shape: 'triangle',
          width: 30,
          height: 30,
          color: 0xff0000,
        },
      ],
      goals: [
        { x: 400, y: 420, type: 'normal' }, // 中心目标筐
        { x: 200, y: 350, type: 'star' },
        { x: 600, y: 350, type: 'star' },
        { x: 400, y: 250, type: 'star' },
      ],
      timeLimit: 90, // 根据评审报告建议 90 秒
      targetScore: 500,
      starCriteria: {
        oneStar: { minScore: 250 },
        twoStars: { minScore: 370, collectStars: 2 },
        threeStars: { minScore: 500, collectStars: 3, maxMoves: 5 },
      },
    };

    // 将所有关卡添加到 Map
    this.levels.set(1, level1);
    this.levels.set(2, level2);
    this.levels.set(3, level3);
    this.levels.set(4, level4);
    this.levels.set(5, level5);
    this.levels.set(6, level6);
    this.levels.set(7, level7);
    this.levels.set(8, level8);
    this.levels.set(9, level9);
    this.levels.set(10, level10);
    this.levels.set(11, level11);
    this.levels.set(12, level12);
    this.levels.set(13, level13);
    this.levels.set(14, level14);
    this.levels.set(15, level15);
    this.levels.set(16, level16);
    this.levels.set(17, level17);
    this.levels.set(18, level18);
    this.levels.set(19, level19);
    this.levels.set(20, level20);
  }

  /**
   * 获取关卡数据
   */
  getLevel(levelId: number): LevelData | null {
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
    if (this.currentLevelId >= this.unlockedLevels && this.unlockedLevels < 20) {
      this.unlockedLevels = this.currentLevelId + 1;
      this.saveProgress();
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
    this.starProgress.clear();
    this.saveProgress();
  }

  /**
   * 保存进度（本地存储）- 添加异常处理
   */
  private saveProgress(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('unlockedLevels', this.unlockedLevels.toString());
        localStorage.setItem('currentLevel', this.currentLevelId.toString());
        localStorage.setItem('starProgress', JSON.stringify(Array.from(this.starProgress.entries())));
      }
    } catch (error) {
      console.error('保存进度失败:', error);
      // 微信小游戏环境可能不支持 localStorage，静默失败
    }
  }

  /**
   * 加载进度（本地存储）- 添加异常处理
   */
  loadProgress(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const unlocked = localStorage.getItem('unlockedLevels');
        const current = localStorage.getItem('currentLevel');
        const starProgressData = localStorage.getItem('starProgress');
        
        if (unlocked) {
          this.unlockedLevels = parseInt(unlocked, 10);
        }
        if (current) {
          this.currentLevelId = parseInt(current, 10);
        }
        if (starProgressData) {
          const progressArray = JSON.parse(starProgressData) as [number, StarProgress][];
          this.starProgress = new Map(progressArray);
        }
      }
    } catch (error) {
      console.error('加载进度失败:', error);
      // 使用默认值
      this.unlockedLevels = 1;
      this.currentLevelId = 1;
    }
  }

  /**
   * 保存星级评价
   */
  /**
   * 加载星级进度（从 localStorage）
   */
  loadStarProgress(): void {
    try {
      const saved = localStorage.getItem('physics-puzzle-star-progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.starProgress = new Map(Object.entries(data));
        console.log('✅ 加载星级进度:', this.starProgress.size, '关');
      }
    } catch (error) {
      console.warn('⚠️ 加载星级进度失败（可能是微信环境不支持 localStorage）:', error);
      this.starProgress = new Map();
    }
  }

  saveStarProgress(levelId: number, stars: number, score: number, collectedStars: number, moves: number): void {
    try {
      const existing = this.starProgress.get(levelId);
      const newProgress: StarProgress = {
        level: levelId,
        stars: stars,
        bestScore: score,
        collectedStars,
        moves,
        completed: true,
      };

      // 如果已有记录，保留最高星级和分数
      if (existing) {
        newProgress.stars = Math.max(existing.stars, stars);
        newProgress.bestScore = Math.max(existing.bestScore, score);
        newProgress.collectedStars = Math.max(existing.collectedStars, collectedStars);
        newProgress.moves = Math.min(existing.moves, moves);
      }

      this.starProgress.set(levelId, newProgress);
      this.saveStarProgressData();
    } catch (error) {
      console.error('保存星级进度失败:', error);
    }
  }

  /**
   * 保存星级进度到 localStorage
   */
  private saveStarProgressData(): void {
    try {
      const data = Object.fromEntries(this.starProgress);
      localStorage.setItem('physics-puzzle-star-progress', JSON.stringify(data));
    } catch (error) {
      console.error('保存星级进度失败:', error);
    }
  }

  /**
   * 获取关卡星级
   */
  getLevelStars(levelId: number): number {
    const progress = this.starProgress.get(levelId);
    return progress ? progress.stars : 0;
  }

  /**
   * 获取关卡最佳分数
   */
  getLevelBestScore(levelId: number): number {
    const progress = this.starProgress.get(levelId);
    return progress ? progress.bestScore : 0;
  }

  /**
   * 获取总星数
   */
  getTotalStars(): number {
    let total = 0;
    this.starProgress.forEach(progress => {
      total += progress.stars;
    });
    return total;
  }

  /**
   * 获取完成的关卡数
   */
  getCompletedLevelsCount(): number {
    let count = 0;
    this.starProgress.forEach(progress => {
      if (progress.completed) count++;
    });
    return count;
  }
}

// 导出单例
export const levelManager = new LevelManager();
