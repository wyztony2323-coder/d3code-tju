# 浮岛参数调整指南

## 参数位置
所有参数都在 `src/components/UniversityHistory.tsx` 文件中，左右两侧浮岛的参数分别在第 196-228 行和第 259-287 行。

---

## 1. 纵深（Z轴位置，与年份数字对齐）

### 参数位置
```typescript
transform: `translateZ(50px) translateX(...) rotateX(75deg) ...`
```

### 调整方法
- **当前值**：`translateZ(50px)`（与年份数字相同）
- **作用**：控制浮岛在 Z 轴上的位置，确保与年份数字一起滚动
- **调整**：修改 `translateZ(50px)` 中的 `50px`
  - 增大：浮岛更靠近屏幕（向前）
  - 减小：浮岛更远离屏幕（向后）
  - **注意**：要与年份数字保持一致，建议保持 `50px`

### 示例
```typescript
// 浮岛更靠近屏幕
transform: `translateZ(100px) translateX(...) ...`

// 浮岛更远离屏幕
transform: `translateZ(0px) translateX(...) ...`
```

---

## 2. 高度（贴合水面的位置）

### 参数位置
```typescript
transform: `... translateY(-350px)`
```

### 调整方法
- **当前值**：`translateY(-350px)`
- **作用**：在浮岛旋转 75 度后，在 Y 轴方向向下移动，贴合水面
- **调整**：修改 `translateY(-350px)` 中的 `-350px`
  - **更负**（如 `-400px`）：浮岛更贴近水面（下沉）
  - **更正**（如 `-300px`）：浮岛更远离水面（上浮）
  - **正值**（如 `-200px`）：浮岛在水面上方（悬空）

### 参考值
- 道路位置：`translateZ(-300px)`
- 堤坝位置：`translateZ(-270px)`
- 水面大约在：`-280px` 左右

### 示例
```typescript
// 浮岛贴合水面
transform: `... translateY(-350px)`

// 浮岛稍微浮在水面上
transform: `... translateY(-320px)`

// 浮岛沉入水中
transform: `... translateY(-380px)`
```

---

## 3. 大小（浮岛的宽度和高度）

### 参数位置
```typescript
// 宽度
const widthVar = 1200 + seededRandom(index) * 800;
// 高度
const heightVar = widthVar * (0.7 + seededRandom(index * 10) * 0.2);
```

### 调整方法

#### 宽度（widthVar）
- **当前值**：`1200 + seededRandom(index) * 800`
  - 最小值：`1200px`
  - 最大值：`1200 + 800 = 2000px`
- **调整**：
  - 修改第一个数字（`1200`）：调整最小宽度
  - 修改第二个数字（`800`）：调整宽度变化范围
  - **示例**：
    ```typescript
    // 更大的浮岛：1500px - 2500px
    const widthVar = 1500 + seededRandom(index) * 1000;
    
    // 更小的浮岛：800px - 1200px
    const widthVar = 800 + seededRandom(index) * 400;
    ```

#### 高度（heightVar）
- **当前值**：`widthVar * (0.7 + seededRandom(index * 10) * 0.2)`
  - 最小高度：`widthVar * 0.7`（宽度的 70%）
  - 最大高度：`widthVar * 0.9`（宽度的 90%）
- **调整**：
  - 修改 `0.7`：调整最小高度比例
  - 修改 `0.2`：调整高度变化范围
  - **示例**：
    ```typescript
    // 更扁的浮岛：60% - 80%
    const heightVar = widthVar * (0.6 + seededRandom(index * 10) * 0.2);
    
    // 更圆的浮岛：80% - 100%
    const heightVar = widthVar * (0.8 + seededRandom(index * 10) * 0.2);
    ```

---

## 4. 间距（浮岛之间的距离）

### 参数位置（左侧浮岛）
```typescript
const baseOffset = 500 + 80; // 基础偏移
const spacingOffset = seededRandom(index * 7) * 800; // 间距偏移
const offsetX = -(baseOffset + spacingOffset);
```

### 参数位置（右侧浮岛）
```typescript
const baseOffset = 50; // 基础偏移
const spacingOffset = seededRandom(seedOffset * 7) * 8000; // 间距偏移
const offsetX = baseOffset + spacingOffset;
```

### 调整方法

#### 左侧浮岛
- **baseOffset**：`500 + 80 = 580px`
  - `500`：道路中心到左边缘的距离（道路宽度 1000px 的一半）
  - `80`：堤岸宽度
  - **调整**：修改这个值可以调整浮岛离道路的距离
    ```typescript
    // 浮岛离道路更远
    const baseOffset = 500 + 80 + 200; // 增加 200px
    
    // 浮岛离道路更近
    const baseOffset = 500 + 80 - 100; // 减少 100px
    ```

- **spacingOffset**：`seededRandom(index * 7) * 800`
  - 范围：`0 - 800px`
  - **调整**：修改 `800` 可以调整浮岛之间的间距
    ```typescript
    // 浮岛之间间距更大：0 - 1500px
    const spacingOffset = seededRandom(index * 7) * 1500;
    
    // 浮岛之间间距更小：0 - 400px
    const spacingOffset = seededRandom(index * 7) * 400;
    ```

#### 右侧浮岛
- **baseOffset**：`50px`
  - 从道路右边缘开始的基础偏移
  - **调整**：修改这个值可以调整浮岛离道路的距离
    ```typescript
    // 浮岛离道路更远
    const baseOffset = 200;
    
    // 浮岛离道路更近
    const baseOffset = 0;
    ```

- **spacingOffset**：`seededRandom(seedOffset * 7) * 8000`
  - 范围：`0 - 8000px`（您已经调整为 8000px）
  - **调整**：修改 `8000` 可以调整浮岛之间的间距
    ```typescript
    // 浮岛之间间距更大：0 - 12000px
    const spacingOffset = seededRandom(seedOffset * 7) * 12000;
    
    // 浮岛之间间距更小：0 - 5000px
    const spacingOffset = seededRandom(seedOffset * 7) * 5000;
    ```

---

## 快速调整示例

### 示例 1：更大的浮岛，更紧密的间距
```typescript
// 大小
const widthVar = 2000 + seededRandom(index) * 1000; // 2000-3000px
const heightVar = widthVar * 0.8; // 固定 80% 高度

// 间距（左侧）
const baseOffset = 500 + 80;
const spacingOffset = seededRandom(index * 7) * 400; // 减小间距范围
```

### 示例 2：更小的浮岛，更大的间距
```typescript
// 大小
const widthVar = 800 + seededRandom(index) * 400; // 800-1200px
const heightVar = widthVar * 0.6; // 固定 60% 高度

// 间距（左侧）
const baseOffset = 500 + 80 + 500; // 离道路更远
const spacingOffset = seededRandom(index * 7) * 1200; // 增大间距范围
```

### 示例 3：浮岛更贴合水面
```typescript
// 高度调整
transform: `translateZ(50px) translateX(${offsetX}px) rotateX(75deg) rotateZ(${rotateZ}deg) translateY(-380px)`
// 将 -350px 改为 -380px，浮岛更贴近水面
```

---

## 参数关系图

```
浮岛定位流程：
1. translateZ(50px)        → Z轴位置（与年份对齐）
2. translateX(offsetX)     → 水平位置（间距控制）
3. rotateX(75deg)          → 旋转贴合水面
4. rotateZ(rotateZ)         → 平面旋转（随机角度）
5. translateY(-350px)      → 贴合水面（高度控制）
```

---

## 注意事项

1. **Z轴对齐**：`translateZ(50px)` 必须与年份数字保持一致，否则滚动时不会对齐
2. **旋转顺序**：必须先 `translateZ` 再 `rotateX`，确保 Z 轴位置正确
3. **间距计算**：左侧使用负值（`-offsetX`），右侧使用正值（`+offsetX`）
4. **随机性**：所有参数都使用 `seededRandom`，确保同一年份每次刷新形状一致
