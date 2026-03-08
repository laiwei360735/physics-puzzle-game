/**
 * 关卡完成场景
 * 
 * 修复说明：
 * - 实现完整的三星评价逻辑
 * - 根据步数/时间/收集星星计算星级
 * - 显示星级 UI 动画
 * - 保存星级进度到 LevelManager
 */

import Phaser from 'phaser';
import { levelManager, LevelData } from '../systems/LevelManager';

interface LevelCompleteData {
  level: number;
  score: number;
  collectedStars?: number;      // 收集的星星数量
  moves?: number;               // 使用的步数
  timeUsed?: number;            // 用时（秒）
}

export class LevelCompleteScene extends Phaser.Scene {
  private level!: number;
  private score!: number;
  private collectedStars: number = 0;
  private moves: number = 0;
  private timeUsed: number = 0;
  private calculatedStars: number = 0;
  private levelData: LevelData | null = null;

  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  init(data: LevelCompleteData): void {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.collectedStars = data.collectedStars || 0;
    this.moves = data.moves || 0;
    this.timeUsed = data.timeUsed || 0;
    
    // 获取关卡数据用于星级计算
    this.levelData = levelManager.getLevel(this.level);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 半透明背景
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(0);

    // 创建容器用于动画
    const container = this.add.container(width / 2, height / 2);
    container.setDepth(1);

    // 完成文字（带动画）
    const completeText = this.add.text(
      0,
      -height / 3,
      '关卡完成!',
      {
        font: 'bold 48px Arial',
        color: '#4ECDC4',
        stroke: '#ffffff',
        strokeThickness: 4,
      }
    );
    completeText.setOrigin(0.5);
    container.add(completeText);

    // 入场动画
    this.tweens.add({
      targets: completeText,
      scaleX: 0,
      scaleY: 0,
      duration: 500,
      ease: 'Back.out',
      delay: 100,
    });

    // 关卡信息
    const levelText = this.add.text(
      0,
      -height / 6,
      `第 ${this.level} 关：${this.levelData?.name || ''}`,
      {
        font: 'bold 32px Arial',
        color: '#ffffff',
      }
    );
    levelText.setOrigin(0.5);
    container.add(levelText);

    // 星级评价容器
    const starsContainer = this.add.container(0, 0);
    container.add(starsContainer);

    // 计算星级
    this.calculatedStars = this.calculateStars();

    // 创建星级显示（逐个显示动画）
    this.createStars(starsContainer, 0, 50);

    // 统计信息
    this.createStats(0, 120);

    // 按钮容器
    const buttonsContainer = this.add.container(0, 200);
    container.add(buttonsContainer);

    // 下一关按钮
    this.createButton(
      buttonsContainer,
      -120,
      0,
      200,
      60,
      '下一关',
      0x4ECDC4,
      () => this.nextLevel()
    );

    // 重玩按钮
    this.createButton(
      buttonsContainer,
      120,
      0,
      200,
      60,
      '重玩',
      0xFFE66D,
      () => this.replayLevel()
    );

    // 保存星级进度
    this.saveStarProgress();
  }

  /**
   * 计算星级
   * 根据关卡设定的标准计算星级
   */
  private calculateStars(): number {
    if (!this.levelData?.starCriteria) {
      // 默认逻辑：根据分数计算
      if (this.score >= 1000) return 3;
      if (this.score >= 500) return 2;
      return 1;
    }

    const criteria = this.levelData.starCriteria;

    // 检查三星条件
    if (this.score >= criteria.threeStars.minScore) {
      // 检查额外条件（收集的星星数量）
      if (criteria.threeStars.collectStars !== undefined) {
        if (this.collectedStars < criteria.threeStars.collectStars) {
          // 不满足三星收集条件，降为二星
        } else {
          // 检查步数限制
          if (criteria.threeStars.maxMoves !== undefined) {
            if (this.moves <= criteria.threeStars.maxMoves) {
              return 3;
            }
            // 步数超限，降为二星
          } else {
            return 3;
          }
        }
      } else {
        // 没有收集要求，检查步数
        if (criteria.threeStars.maxMoves !== undefined) {
          if (this.moves <= criteria.threeStars.maxMoves) {
            return 3;
          }
        } else {
          return 3;
        }
      }
    }

    // 检查二星条件
    if (this.score >= criteria.twoStars.minScore) {
      if (criteria.twoStars.collectStars !== undefined) {
        if (this.collectedStars >= criteria.twoStars.collectStars) {
          return 2;
        }
        // 收集不够，降为一星
        return 1;
      }
      return 2;
    }

    // 一星
    if (this.score >= criteria.oneStar.minScore) {
      return 1;
    }

    // 未完成
    return 0;
  }

  /**
   * 创建星级显示
   */
  private createStars(container: Phaser.GameObjects.Container, x: number, y: number): void {
    const stars: Phaser.GameObjects.Text[] = [];
    
    for (let i = 0; i < 3; i++) {
      const star = this.add.text(
        (i - 1) * 60,
        0,
        '☆',
        {
          font: 'bold 56px Arial',
          color: '#FFD700',
          stroke: '#ffffff',
          strokeThickness: 3,
        }
      );
      star.setOrigin(0.5);
      stars.push(star);
      container.add(star);

      // 逐个显示动画
      if (i < this.calculatedStars) {
        this.tweens.add({
          targets: star,
          scaleX: 0,
          scaleY: 0,
          duration: 300,
          ease: 'Back.out',
          delay: 300 + i * 200,
          onComplete: () => {
            star.setText('⭐');
            this.tweens.add({
              targets: star,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 200,
              ease: 'Sine.out',
              yoyo: true,
            });
          },
        });
      } else {
        star.setAlpha(0.3);
      }
    }

    // 星级文字
    const starText = this.add.text(
      0,
      50,
      this.getStarText(this.calculatedStars),
      {
        font: 'bold 24px Arial',
        color: '#FFD700',
      }
    );
    starText.setOrigin(0.5);
    container.add(starText);

    this.tweens.add({
      targets: starText,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      ease: 'Back.out',
      delay: 1200,
    });
  }

  /**
   * 获取星级文字描述
   */
  private getStarText(stars: number): string {
    switch (stars) {
      case 3:
        return '⭐⭐⭐ 完美！';
      case 2:
        return '⭐⭐ 很棒！';
      case 1:
        return '⭐ 完成！';
      default:
        return '继续加油！';
    }
  }

  /**
   * 创建统计信息显示
   */
  private createStats(x: number, y: number): void {
    const statsContainer = this.add.container(x, y);

    // 背景
    const bg = this.add.rectangle(0, 0, 300, 100, 0x292F36, 0.8);
    bg.setStrokeStyle(2, 0x4ECDC4);
    statsContainer.add(bg);

    // 分数
    const scoreText = this.add.text(
      -130,
      -20,
      `分数：${this.score}`,
      {
        font: 'bold 24px Arial',
        color: '#FFE66D',
      }
    );
    scoreText.setOrigin(0.5, 0);
    statsContainer.add(scoreText);

    // 收集的星星
    const collectedText = this.add.text(
      -130,
      10,
      `收集星星：${this.collectedStars}`,
      {
        font: '20px Arial',
        color: '#ffffff',
      }
    );
    collectedText.setOrigin(0.5, 0);
    statsContainer.add(collectedText);

    // 步数
    const movesText = this.add.text(
      -130,
      40,
      `步数：${this.moves}`,
      {
        font: '20px Arial',
        color: '#ffffff',
      }
    );
    movesText.setOrigin(0.5, 0);
    statsContainer.add(movesText);

    // 用时
    const timeText = this.add.text(
      130,
      -20,
      `用时：${this.timeUsed}s`,
      {
        font: 'bold 24px Arial',
        color: '#4ECDC4',
      }
    );
    timeText.setOrigin(1, 0);
    statsContainer.add(timeText);

    // 最佳分数
    const bestScore = levelManager.getLevelBestScore(this.level);
    if (bestScore > 0) {
      const bestText = this.add.text(
        130,
        10,
        `最佳：${bestScore}`,
        {
          font: '18px Arial',
          color: '#888888',
        }
      );
      bestText.setOrigin(1, 0);
      statsContainer.add(bestText);
    }
  }

  /**
   * 创建按钮
   */
  private createButton(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number,
    callback: () => void
  ): void {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, width, height, color);
    bg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(0, 0, text, {
      font: 'bold 24px Arial',
      color: '#292F36',
    });
    btnText.setOrigin(0.5);

    button.add([bg, btnText]);

    // 按钮交互效果
    bg.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.GetColor(
        Phaser.Display.Color.GetR(color) + 20,
        Phaser.Display.Color.GetG(color) + 20,
        Phaser.Display.Color.GetB(color) + 20
      ));
    });
    
    bg.on('pointerout', () => {
      bg.setFillStyle(color);
    });
    
    bg.on('pointerdown', () => {
      bg.setFillStyle(Phaser.Display.Color.GetColor(
        Phaser.Display.Color.GetR(color) - 30,
        Phaser.Display.Color.GetG(color) - 30,
        Phaser.Display.Color.GetB(color) - 30
      ));
    });
    
    bg.on('pointerup', () => {
      bg.setFillStyle(color);
      callback();
    });

    container.add(button);
  }

  /**
   * 保存星级进度
   */
  private saveStarProgress(): void {
    levelManager.saveStarProgress(
      this.level,
      this.calculatedStars,
      this.score,
      this.collectedStars,
      this.moves
    );
  }

  /**
   * 进入下一关
   */
  private nextLevel(): void {
    const nextLevel = this.level + 1;
    
    // 检查下一关是否解锁
    if (nextLevel <= 20) {
      levelManager.unlockNextLevel();
      this.scene.start('GameScene', { level: nextLevel });
    } else {
      // 已通关所有关卡
      this.showCompletionMessage();
    }
  }

  /**
   * 重玩当前关卡
   */
  private replayLevel(): void {
    this.scene.start('GameScene', { level: this.level });
  }

  /**
   * 显示通关消息
   */
  private showCompletionMessage(): void {
    const { width, height } = this.cameras.main;
    
    const msg = this.add.text(width / 2, height / 2, '恭喜通关所有关卡！\n更多精彩关卡即将更新...', {
      font: 'bold 32px Arial',
      color: '#4ECDC4',
      align: 'center',
    });
    msg.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}
