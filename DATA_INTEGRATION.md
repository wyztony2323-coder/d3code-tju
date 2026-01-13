# 数据集成说明

## 已集成的数据文件

所有JSON数据文件已放置在 `data/` 目录下：

1. **tju_histography_data.json** - 历史事件数据（329条记录）
2. **stats_population.json** - 人口统计数据（学生、教师数量）
3. **discipline_evolution.json** - 学科演变历史
4. **flow_1952.json** - 1952年院系调整流程图数据
5. **alumni_network.json** - 校友网络关系数据
6. **structure_academics.json** - 学科体系结构数据

## 数据转换架构

### 1. 类型定义 (`src/types/histography.ts`)
- 定义了所有新数据格式的TypeScript接口
- 与现有类型系统兼容

### 2. 数据加载器 (`src/data/dataLoader.ts`)
- `convertHistographyToHistoryEvents()` - 将历史事件数据转换为现有格式
- `getCampusDataFromHistography()` - 从历史数据中提取建筑信息
- `getAlumniDataFromNetwork()` - 从校友网络数据生成校友图谱
- `getPopulationStats()` - 获取人口统计数据
- `getDisciplineEvolution()` - 获取学科演变数据
- `getFlow1952()` - 获取1952年院系调整流程数据
- `getAcademicStructure()` - 获取学科结构数据

### 3. 数据集成 (`src/data/uni_detail.ts`)
- `uniDetailData` 现在自动从新的历史数据转换而来
- 保留了原有数据作为后备（`uniDetailDataLegacy`）

### 4. 扩展数据 (`src/data/mockExtensions.ts`)
- `getCampusData()` - 优先使用新数据，后备使用mock数据
- `getAlumniData()` - 优先使用新数据，后备使用mock数据

## 数据映射逻辑

### 历史事件转换
- 按年份分组历史事件
- 优先选择 FOUNDATION/CAMPUS/DISCIPLINES 类型作为主要事件
- 自动合并人口统计数据（学生数量）
- 自动合并学科演变数据（专业分布）

### 建筑数据提取
- 从历史事件中提取 CAMPUS 类型事件
- 使用地理信息（geo）生成建筑描述
- 自动生成占位图片URL

### 校友网络数据
- 使用统一的校友网络数据
- 根据节点group字段区分杰出校友和普通毕业生
- 保留网络关系链接

## 使用方式

### 在组件中使用
```typescript
import { uniDetailData } from '@/data/uni_detail';
import { getCampusData, getAlumniData } from '@/data/mockExtensions';
import { getPopulationStats, getDisciplineEvolution } from '@/data/dataLoader';

// 获取历史事件（已自动转换）
const events = uniDetailData;

// 获取建筑数据
const campus = getCampusData(1952);

// 获取校友数据
const alumni = getAlumniData(1952);

// 获取人口统计
const stats = getPopulationStats(1952);

// 获取学科演变
const disciplines = getDisciplineEvolution(1952);
```

## 数据特点

1. **自动转换**：新数据自动转换为现有格式，无需修改组件代码
2. **向后兼容**：保留原有数据作为后备，确保稳定性
3. **数据丰富**：从5条记录扩展到329条历史事件
4. **类型安全**：完整的TypeScript类型定义

## 注意事项

1. JSON文件路径：`data/` 目录在项目根目录，不在 `src/` 下
2. 数据转换：每年可能有多个事件，系统会自动选择主要事件
3. 学科数据：如果没有对应年份的学科数据，会使用默认值
4. 建筑数据：只有包含地理信息（geo）的CAMPUS类型事件才会生成建筑数据

## 未来扩展

可以进一步利用这些数据：
- 使用 `flow_1952.json` 创建1952年院系调整的可视化
- 使用 `structure_academics.json` 创建学科结构树状图
- 使用 `discipline_evolution.json` 创建学科演变时间线
- 使用 `alumni_network.json` 创建更丰富的校友网络可视化
