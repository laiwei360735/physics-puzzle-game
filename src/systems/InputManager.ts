/**
 * 输入管理系统
 * 处理键盘、鼠标、触摸等输入
 */

import Phaser from 'phaser';

export interface InputConfig {
  enableKeyboard: boolean;
  enableMouse: boolean;
  enableTouch: boolean;
  dragThreshold: number;
}

export class InputManager {
  private scene: Phaser.Scene;
  private config: InputConfig;
  private isDragging: boolean = false;
  private dragStartPos: Phaser.Math.Vector2 | null = null;
  private dragCurrentPos: Phaser.Math.Vector2 | null = null;
  private draggedObject: Phaser.GameObjects.GameObject | null = null;

  // 输入事件回调
  private onDragStart?: (object: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer) => void;
  private onDragMove?: (object: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer) => void;
  private onDragEnd?: (object: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer) => void;
  private onTap?: (pointer: Phaser.Input.Pointer) => void;
  private onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;

  constructor(scene: Phaser.Scene, config?: Partial<InputConfig>) {
    this.scene = scene;
    this.config = {
      enableKeyboard: true,
      enableMouse: true,
      enableTouch: true,
      dragThreshold: 10,
      ...config,
    };

    this.setupInput();
  }

  /**
   * 设置输入
   */
  private setupInput(): void {
    // 键盘输入
    if (this.config.enableKeyboard) {
      this.setupKeyboard();
    }

    // 鼠标/触摸输入
    if (this.config.enableMouse || this.config.enableTouch) {
      this.setupPointer();
    }
  }

  /**
   * 设置键盘输入
   */
  private setupKeyboard(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    // ESC - 暂停
    keyboard.on('keydown-ESC', () => {
      this.scene.events.emit('pause');
    });

    // R - 重置
    keyboard.on('keydown-R', () => {
      this.scene.events.emit('reset');
    });

    // 方向键
    keyboard.on('keydown-UP', () => {
      this.scene.events.emit('keyUp');
    });
    keyboard.on('keydown-DOWN', () => {
      this.scene.events.emit('keyDown');
    });
    keyboard.on('keydown-LEFT', () => {
      this.scene.events.emit('keyLeft');
    });
    keyboard.on('keydown-RIGHT', () => {
      this.scene.events.emit('keyRight');
    });

    // 空格键
    keyboard.on('keydown-SPACE', () => {
      this.scene.events.emit('keySpace');
    });
  }

  /**
   * 设置指针输入
   */
  private setupPointer(): void {
    const input = this.scene.input;

    // 按下
    input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer);
    });

    // 移动
    input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerMove(pointer);
    });

    // 释放
    input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerUp(pointer);
    });
  }

  /**
   * 处理指针按下
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    // 获取点击位置的游戏对象
    const objects = this.scene.matter.world.getObjectsAt(pointer.x, pointer.y);
    
    if (objects.length > 0) {
      const gameObject = objects[0].gameObject as Phaser.GameObjects.GameObject;
      if (gameObject && gameObject.input?.enabled) {
        this.startDrag(gameObject, pointer);
      }
    }

    // 记录按下位置
    this.dragStartPos = new Phaser.Math.Vector2(pointer.x, pointer.y);
    this.isDragging = true;
  }

  /**
   * 处理指针移动
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isDragging && this.draggedObject) {
      this.dragCurrentPos = new Phaser.Math.Vector2(pointer.x, pointer.y);
      
      if (this.onDragMove) {
        this.onDragMove(this.draggedObject, pointer);
      }
    }
  }

  /**
   * 处理指针释放
   */
  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.isDragging && this.draggedObject) {
      if (this.onDragEnd) {
        this.onDragEnd(this.draggedObject, pointer);
      }
    }

    // 检测点击（短距离移动）
    if (this.dragStartPos) {
      const distance = Phaser.Math.Distance.Between(
        this.dragStartPos.x,
        this.dragStartPos.y,
        pointer.x,
        pointer.y
      );

      if (distance < this.config.dragThreshold) {
        // 点击事件
        if (this.onTap) {
          this.onTap(pointer);
        }
      } else {
        // 滑动事件
        this.detectSwipe(this.dragStartPos, pointer);
      }
    }

    this.isDragging = false;
    this.draggedObject = null;
    this.dragStartPos = null;
    this.dragCurrentPos = null;
  }

  /**
   * 开始拖拽
   */
  private startDrag(object: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer): void {
    this.draggedObject = object;
    
    if (this.onDragStart) {
      this.onDragStart(object, pointer);
    }

    this.scene.events.emit('dragStart', { object, pointer });
  }

  /**
   * 检测滑动方向
   */
  private detectSwipe(start: Phaser.Math.Vector2, end: Phaser.Input.Pointer): void {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < this.config.dragThreshold) return;

    let direction: 'up' | 'down' | 'left' | 'right';

    if (absDx > absDy) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }

    if (this.onSwipe) {
      this.onSwipe(direction);
    }

    this.scene.events.emit('swipe', { direction, start, end });
  }

  /**
   * 设置拖拽回调
   */
  setDragCallbacks(
    onStart: (object: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer) => void,
    onMove: (object: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer) => void,
    onEnd: (object: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer) => void
  ): void {
    this.onDragStart = onStart;
    this.onDragMove = onMove;
    this.onDragEnd = onEnd;
  }

  /**
   * 设置点击回调
   */
  setTapCallback(callback: (pointer: Phaser.Input.Pointer) => void): void {
    this.onTap = callback;
  }

  /**
   * 设置滑动回调
   */
  setSwipeCallback(callback: (direction: 'up' | 'down' | 'left' | 'right') => void): void {
    this.onSwipe = callback;
  }

  /**
   * 检查是否正在拖拽
   */
  getIsDragging(): boolean {
    return this.isDragging;
  }

  /**
   * 获取拖拽对象
   */
  getDraggedObject(): Phaser.GameObjects.GameObject | null {
    return this.draggedObject;
  }

  /**
   * 获取指针位置
   */
  getPointerPosition(): Phaser.Math.Vector2 | null {
    const pointer = this.scene.input.activePointer;
    if (pointer) {
      return new Phaser.Math.Vector2(pointer.x, pointer.y);
    }
    return null;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
    
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown');
    }
  }
}
