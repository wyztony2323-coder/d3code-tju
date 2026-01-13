# 北洋大学/天津大学校史长卷 (3D可视化)

> 基于 React + Umi + Three.js + D3.js 的 3D 纵深长卷可视化项目，展示天津大学历史沿革、学科分布与人才流向的动态演变。

---

## 📋 目录

- [技术栈](#技术栈)
- [快速启动](#快速启动)
- [项目架构](#项目架构)
- [核心代码结构](#核心代码结构)
- [数据集成说明](#数据集成说明)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

---

## 🛠️ 技术栈

### 核心框架
- **React 17.x** - UI框架
- **Umi 3.x** - 企业级前端应用框架
- **TypeScript** - 类型安全

### 3D渲染
- **Three.js 0.133.0** - 3D图形库
- **@react-three/fiber** - React Three.js 渲染器
- **@react-three/drei** - Three.js 辅助库（Sky, Sparkles, Water等）
- **three-stdlib** - Three.js 标准库（Water shader）

### 数据可视化
- **D3.js 7.x** - 数据驱动文档（力导向图、图表等）
- **Ant Design 4** - UI组件库

### 样式方案
- **CSS3 3D Transforms** - 3D变换和透视
- **CSS Animations** - 动画效果

---

## 🚀 快速启动

### 环境要求
- Node.js >= 18.x (推荐 LTS 版本)
- Yarn 或 npm

### 安装步骤

```bash
# 1. 安装依赖
yarn install

# 2. 启动开发服务器
yarn start

# 3. 浏览器访问 http://localhost:8000
```

> **注意**：如果遇到 `OpenSSL` 相关错误，项目已配置 `NODE_OPTIONS=--openssl-legacy-provider`，通常无需额外处理。

### 构建生产版本

```bash
yarn build
# 输出目录：dist/
```

---

## 🏗️ 项目架构

### 渲染架构：混合渲染（Hybrid Rendering）

项目采用**分层渲染**策略，兼顾性能和交互性：

```
┌─────────────────────────────────────┐
│   UI层 (HTML/CSS)                  │
│   - 道路、文字、交互元素            │
│   - 透明点击区域                    │
│   - z-index: 10+                    │
├─────────────────────────────────────┤
│   3D环境层 (Three.js/WebGL)        │
│   - 水面、天空、雾气                │
│   - 粒子效果                        │
│   - z-index: -1 (背景层)            │
└─────────────────────────────────────┘
```

**优势**：
- 3D环境提供真实感（水面、光照、粒子）
- UI层保持易交互（点击、滚动、模态框）
- 性能优化（3D只渲染环境，UI用CSS）

### 数据流架构

```
data/*.json (原始数据)
    ↓
src/data/dataLoader.ts (数据转换)
    ↓
src/data/uni_detail.ts (统一接口)
    ↓
src/components/UniversityHistory.tsx (主组件)
    ↓
UI渲染 + 3D环境同步
```

---

## 📁 核心代码结构

```
├── src/
│   ├── components/              # 组件目录
│   │   ├── UniversityHistory.tsx    # ⭐ 主视口组件（3D道路、时间轴）
│   │   ├── HistoryEnvironment.tsx   # 3D环境（水面、天空、粒子）
│   │   ├── InfoPanel.tsx            # 右上角D3仪表盘
│   │   ├── AlumniGraphModal.tsx     # 校友网络图（D3力导向图）
│   │   ├── CampusBuildingModal.tsx  # 建筑信息弹窗
│   │   ├── ScrollModal.tsx          # 历史详情弹窗
│   │   └── MajorsOverlay.tsx        # 学科分布覆盖层
│   │
│   ├── data/                    # 数据层
│   │   ├── dataLoader.ts            # ⭐ 数据加载和转换（JSON → 组件格式）
│   │   ├── uni_detail.ts            # 历史事件数据（自动从JSON转换）
│   │   └── mockExtensions.ts        # 扩展数据（建筑、校友）
│   │
│   ├── types/                   # TypeScript类型定义
│   │   ├── histography.ts           # 历史数据接口
│   │   ├── extensions.ts            # 扩展数据接口（建筑、校友）
│   │   └── index.ts                 # 通用类型
│   │
│   ├── styles/                  # 样式文件
│   │   └── timeline.css             # ⭐ 核心样式（CSS3D、动画、光效）
│   │
│   ├── pages/                   # 页面
│   │   └── index.tsx               # 入口页面（集成3D环境和主组件）
│   │
│   └── lib/                     # 工具库
│       ├── TimelineRendererManager.ts  # 渲染管理器
│       └── i18n.ts                    # 国际化（可选）
│
├── data/                        # ⭐ JSON数据文件（项目根目录）
│   ├── tju_histography_data.json     # 历史事件（329条）
│   ├── stats_population.json         # 人口统计
│   ├── discipline_evolution.json     # 学科演变
│   ├── flow_1952.json               # 1952年院系调整流程
│   ├── alumni_network.json          # 校友网络
│   └── structure_academics.json      # 学科结构
│
├── .umirc.ts                    # Umi配置文件
└── package.json                 # 依赖配置
```

### 关键文件说明

#### 1. `src/components/UniversityHistory.tsx`
**主视口组件**，负责：
- 3D道路的渲染（CSS 3D Transforms）
- 时间轴的滚动逻辑
- 左右侧交互模块（建筑、校友）
- 与3D环境的滚动同步

**核心逻辑**：
```typescript
// 道路数据循环渲染
ROAD_DATA.map((item, index) => {
  const zPos = index * 400; // Z轴间距
  return <div style={{ transform: `translate3d(0, 0, ${zPos}px)` }} />
})
```

#### 2. `src/components/HistoryEnvironment.tsx`
**3D环境组件**，使用 React Three Fiber：
- 水面渲染（Water shader）
- 天空盒（Sky组件）
- 粒子效果（Sparkles）
- 摄像机同步滚动

#### 3. `src/data/dataLoader.ts`
**数据转换层**，核心函数：
- `convertHistographyToHistoryEvents()` - JSON历史数据 → 组件格式
- `getCampusDataFromHistography()` - 提取建筑信息
- `getAlumniDataFromNetwork()` - 生成校友网络数据

#### 4. `src/styles/timeline.css`
**核心样式文件**，包含：
- CSS 3D变换（`transform-style: preserve-3d`）
- 透视设置（`perspective`, `perspective-origin`）
- 动画关键帧（`@keyframes`）
- 光效和阴影

---

## 📊 数据集成说明

### 数据文件位置
所有JSON数据文件位于 **`data/`** 目录（项目根目录，不在 `src/` 下）。

### 数据文件说明

| 文件 | 说明 | 记录数 |
|------|------|--------|
| `tju_histography_data.json` | 历史事件数据 | 329条 |
| `stats_population.json` | 人口统计（学生、教师） | 11条 |
| `discipline_evolution.json` | 学科演变历史 | 14条 |
| `flow_1952.json` | 1952年院系调整流程 | 节点+链接 |
| `alumni_network.json` | 校友网络关系 | 节点+链接 |
| `structure_academics.json` | 学科体系结构 | 树状结构 |

### 数据使用方式

```typescript
// 1. 获取历史事件（自动转换）
import { uniDetailData } from '@/data/uni_detail';
const events = uniDetailData; // HistoryEvent[]

// 2. 获取建筑数据
import { getCampusData } from '@/data/mockExtensions';
const campus = getCampusData(1952); // CampusInfo | null

// 3. 获取校友数据
import { getAlumniData } from '@/data/mockExtensions';
const alumni = getAlumniData(1952); // AlumniNetworkData | null

// 4. 获取其他数据
import { 
  getPopulationStats, 
  getDisciplineEvolution,
  getFlow1952,
  getAcademicStructure 
} from '@/data/dataLoader';
```

### 数据转换逻辑

1. **历史事件转换**：
   - 按年份分组
   - 优先选择 `FOUNDATION`/`CAMPUS`/`DISCIPLINES` 类型
   - 自动合并人口统计和学科数据

2. **建筑数据提取**：
   - 从 `CAMPUS` 类型事件中提取
   - 使用 `geo` 字段生成描述

3. **校友网络**：
   - 使用统一的校友网络数据
   - 根据 `group` 字段区分类型

> 📖 详细说明请参考 `DATA_INTEGRATION.md`

---

## 💻 开发指南

### 添加新的历史事件

1. **编辑 `data/tju_histography_data.json`**：
```json
{
  "year": 2025,
  "title": "新事件标题",
  "content": "事件描述...",
  "category": "FOUNDATION",
  "category_cn": "建校与制度变迁"
}
```

2. **数据会自动转换**，无需修改组件代码。

### 修改3D道路样式

编辑 `src/styles/timeline.css`：
- `.road-segment-node` - 道路分段样式
- `.timeline-tick-bar` - 时间轴刻度
- `.info-island` - 浮岛面板

### 添加新的交互模块

1. 在 `UniversityHistory.tsx` 中添加新的交互区域
2. 创建对应的 Modal 组件（参考 `AlumniGraphModal.tsx`）
3. 在 `dataLoader.ts` 中添加数据获取函数

### 修改3D环境

编辑 `src/components/HistoryEnvironment.tsx`：
- `Ocean` 组件 - 水面参数
- `Sky` 组件 - 天空参数
- `Sparkles` 组件 - 粒子效果

### 调试技巧

1. **查看3D坐标**：
   - 打开浏览器控制台
   - 检查元素的 `transform` 属性

2. **调整透视**：
   - 修改 `.scene-3d` 的 `perspective` 值

3. **同步问题**：
   - 检查 `HistoryEnvironment` 的 `scrollY` 同步逻辑

---

## ❓ 常见问题

### 开发环境问题

**Q: `yarn install` 报错 sass 相关？**
```bash
yarn add -D sass sass-loader@10.4.1
```

**Q: 启动报错 `scheduler` 模块？**
- 项目已配置 `postinstall` 脚本自动修复
- 如仍有问题，运行：`yarn postinstall`

**Q: 白屏或编译错误？**
1. 检查浏览器控制台（F12）
2. 删除 `src/.umi` 文件夹后重启
3. 检查 JSON 文件格式（确保无中文引号）

### 数据相关问题

**Q: 修改JSON后数据未更新？**
- 重启开发服务器（`yarn start`）
- 检查 JSON 语法（使用 JSON 验证工具）

**Q: 某些年份没有数据？**
- 检查 `dataLoader.ts` 的转换逻辑
- 查看是否有对应年份的统计数据

### 3D渲染问题

**Q: 浮岛位置不对？**
- 检查 `timeline.css` 中的 `transform` 顺序
- 注意：`translate` 必须在 `rotate` 之前

**Q: 3D环境不显示？**
- 检查浏览器是否支持 WebGL
- 查看控制台是否有 Three.js 错误

**Q: 滚动不同步？**
- 检查 `src/pages/index.tsx` 中的 `scrollY` 状态
- 确认 `HistoryEnvironment` 接收到了正确的值

---

## 🔧 扩展开发建议

### 待实现功能

1. **1952年院系调整可视化**
   - 使用 `flow_1952.json` 创建 Sankey 图或流程图

2. **学科结构树状图**
   - 使用 `structure_academics.json` 创建 D3 树状图

3. **学科演变时间线**
   - 使用 `discipline_evolution.json` 创建时间轴可视化

4. **更丰富的校友网络**
   - 按年份动态加载不同的校友网络
   - 添加交互式筛选

5. **地理信息可视化**
   - 使用历史事件中的 `geo` 字段
   - 集成地图组件（如高德地图、百度地图）

### 性能优化建议

1. **虚拟滚动**：对于大量历史事件，考虑实现虚拟滚动
2. **3D对象池**：复用3D对象，减少创建/销毁开销
3. **图片懒加载**：建筑图片按需加载
4. **数据分片**：按需加载历史数据

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 样式使用 CSS Modules 或 styled-components（可选）

---

## 📚 相关文档

- [Umi 官方文档](https://umijs.org/)
- [React Three Fiber 文档](https://docs.pmnd.rs/react-three-fiber)
- [D3.js 文档](https://d3js.org/)
- [Three.js 文档](https://threejs.org/docs/)

---
