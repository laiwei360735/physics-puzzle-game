# 物理益智小游戏 - 美术风格指南

## 🎨 项目概述

**游戏类型：** 物理益智微信小游戏  
**目标用户：** 全年龄段  
**整体风格：** 休闲、可爱、治愈系

---

## 🌈 色彩系统

### 主色调

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| 天空蓝 | `#87CEEB` | 背景主色、天空元素 |
| 草地绿 | `#90EE90` | 地面、植物元素 |
| 阳光黄 | `#FFD700` | 高光、星星、奖励 |
| 温暖橙 | `#FFA500` | 按钮、交互元素 |
| 云朵白 | `#F0F8FF` | 云朵、高光 |

### 辅助色

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| 柔和粉 | `#FFB6C1` | 装饰、爱心元素 |
| 薄荷绿 | `#98FF98` | 成功状态、治愈元素 |
| 淡紫色 | `#E6E6FA` | 特殊道具、魔法效果 |
| 深棕色 | `#8B4513` | 文字、边框 |

### 渐变色

```css
/* 天空渐变 */
.sky-gradient {
  background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #F0F8FF 100%);
}

/* 草地渐变 */
.grass-gradient {
  background: linear-gradient(180deg, #90EE90 0%, #3CB371 100%);
}

/* 按钮渐变 */
.button-gradient {
  background: linear-gradient(180deg, #FFA500 0%, #FF8C00 100%);
}
```

---

## 📝 字体规范

### 中文字体

```css
/* 主字体 - 圆润可爱风格 */
font-family: 'Varela Round', 'Nunito', 'Microsoft YaHei', sans-serif;

/* 标题字体 */
font-family: 'Fredoka One', 'Arial Rounded MT Bold', sans-serif;

/* 数字字体 */
font-family: 'Quicksand', 'Verdana', sans-serif;
```

### 字号规范

| 用途 | 字号 | 字重 | 颜色 |
|------|------|------|------|
| 大标题 | 32px | Bold | #8B4513 |
| 小标题 | 24px | SemiBold | #8B4513 |
| 正文 | 18px | Regular | #555555 |
| 按钮文字 | 20px | Bold | #FFFFFF |
| 得分数字 | 28px | Bold | #FFD700 |

---

## 🎭 UI 风格规范

### 按钮样式

```css
.primary-button {
  background: linear-gradient(180deg, #FFA500 0%, #FF8C00 100%);
  border: 3px solid #8B4513;
  border-radius: 15px;
  padding: 12px 30px;
  color: #FFFFFF;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 0 #8B4513;
  transition: all 0.1s ease;
}

.primary-button:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #8B4513;
}
```

### 面板样式

```css
.game-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 4px solid #8B4513;
  border-radius: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
```

### 图标风格

- **线条粗细：** 3-4px
- **圆角半径：** 8-12px
- **填充方式：** 扁平化 + 轻微渐变
- **图标尺寸：** 48x48px, 64x64px, 96x96px

---

## 🎮 游戏元素设计

### 主角设计

**形象：** 圆润的小球角色，带有可爱表情

```svg
<!-- 主角基础造型 -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- 身体 -->
  <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#8B4513" stroke-width="3"/>
  
  <!-- 眼睛 -->
  <ellipse cx="35" cy="40" rx="8" ry="10" fill="#FFFFFF" stroke="#8B4513" stroke-width="2"/>
  <ellipse cx="65" cy="40" rx="8" ry="10" fill="#FFFFFF" stroke="#8B4513" stroke-width="2"/>
  <circle cx="37" cy="42" r="4" fill="#000000"/>
  <circle cx="67" cy="42" r="4" fill="#000000"/>
  
  <!-- 腮红 -->
  <circle cx="25" cy="55" r="6" fill="#FFB6C1" opacity="0.6"/>
  <circle cx="75" cy="55" r="6" fill="#FFB6C1" opacity="0.6"/>
  
  <!-- 嘴巴 -->
  <path d="M 35 60 Q 50 70 65 60" stroke="#8B4513" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>
```

### 道具设计

| 道具名称 | 形状 | 颜色 | 尺寸 |
|---------|------|------|------|
| 星星 | 五角星 | #FFD700 | 40x40px |
| 爱心 | 心形 | #FFB6C1 | 40x40px |
| 钻石 | 菱形 | #98FB98 | 40x40px |
| 弹簧 | 螺旋形 | #FFA500 | 50x60px |
| 气泡 | 圆形 | #87CEEB | 40x40px |

### 背景元素

| 元素 | 描述 | 颜色 |
|------|------|------|
| 云朵 | 蓬松圆形组合 | #FFFFFF |
| 太阳 | 圆形 + 光芒 | #FFD700 |
| 草地 | 波浪形顶部 | #90EE90 |
| 花朵 | 五瓣花形 | #FFB6C1, #FFD700 |
| 树木 | 圆形树冠 + 棕色树干 | #228B22, #8B4513 |

---

## ✨ 动画效果规范

### 成功动画

```css
/* 星星闪烁 */
@keyframes star-twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* 弹跳效果 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 旋转庆祝 */
@keyframes spin-celebrate {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}
```

### 失败动画

```css
/* 摇晃效果 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

/* 渐隐消失 */
@keyframes fade-out {
  0% { opacity: 1; }
  100% { opacity: 0.3; }
}
```

### 过渡动画

```css
/* 平滑过渡 */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 弹性过渡 */
.transition-bouncy {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 页面切换 */
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out-left {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
}
```

---

## 📐 尺寸规范

### 画布尺寸

| 平台 | 分辨率 | 备注 |
|------|--------|------|
| 微信小程序 | 750x1334px | 设计稿基准 |
| 适配方案 | 等比缩放 | 最小边适配 |

### UI 元素尺寸

| 元素 | 宽度 | 高度 | 边距 |
|------|------|------|------|
| 主按钮 | 200px | 60px | 20px |
| 次按钮 | 150px | 50px | 15px |
| 图标按钮 | 64px | 64px | 10px |
| 面板 | 600px | 400px | 30px |
| 关卡卡片 | 180px | 180px | 15px |

---

## 🎯 设计原则

1. **简洁明快** - 避免复杂纹理，使用扁平化设计
2. **色彩鲜明** - 高饱和度，但不刺眼
3. **圆润可爱** - 大量使用圆角和曲线
4. **层次清晰** - 通过阴影和层次区分元素
5. **反馈及时** - 所有交互都有视觉反馈

---

## 📦 资源输出清单

详见 `assets-list.md`

---

**版本：** v1.0  
**更新日期：** 2026-03-08  
**设计师：** AI 美术设计师
