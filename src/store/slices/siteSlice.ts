import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// MCV 多视图协调状态
export type EventCategory =
  | 'politics'
  | 'academic'
  | 'campus'
  | 'discipline'
  | 'all';
export type HistoricalPeriod =
  | 'founding'
  | 'republic'
  | 'war'
  | 'adjustment'
  | 'reform'
  | 'all';

interface SiteState {
  language: 'zh' | 'en';
  currentYear: number;
  isPanelActive: boolean;
  autoScroll: boolean;
  // MCV 多视图协调状态
  hoveredYear: number | null; // 当前鼠标悬停年份
  selectedCategory: EventCategory; // 筛选分类
  selectedPeriod: HistoricalPeriod; // 历史时期筛选
  timeRange: [number, number] | null; // 当前刷选时间段 [start, end]
  sidePanelType: 'campus' | 'alumni' | null; // 侧边面板类型
  sidePanelYear: number | null; // 侧边面板对应的年份
  scrollZ: number; // 滚动位置（Z轴）
}

const initialState: SiteState = {
  language: 'zh',
  currentYear: 1895,
  isPanelActive: false,
  autoScroll: true,
  // MCV 初始状态
  hoveredYear: null,
  selectedCategory: 'all',
  selectedPeriod: 'all',
  timeRange: null,
  sidePanelType: null,
  sidePanelYear: null,
  scrollZ: 0, // 初始滚动位置
};

export const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    // 切换语言
    setLanguage: (state, action: PayloadAction<'zh' | 'en'>) => {
      state.language = action.payload;
    },
    // 更新当前相机所在的年份
    setCurrentYear: (state, action: PayloadAction<number>) => {
      state.currentYear = action.payload;
    },
    // 控制侧边/右上面板显示隐藏
    setPanelActive: (state, action: PayloadAction<boolean>) => {
      state.isPanelActive = action.payload;
    },
    // 切换自动播放/手动滚动
    toggleAutoScroll: (state) => {
      state.autoScroll = !state.autoScroll;
    },
    // MCV 多视图协调 Actions
    setHoveredYear: (state, action: PayloadAction<number | null>) => {
      state.hoveredYear = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<EventCategory>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedPeriod: (state, action: PayloadAction<HistoricalPeriod>) => {
      state.selectedPeriod = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<[number, number] | null>) => {
      state.timeRange = action.payload;
      // 如果设置了时间范围，自动更新当前年份到范围开始
      if (action.payload) {
        state.currentYear = action.payload[0];
      }
    },
    setSidePanel: (
      state,
      action: PayloadAction<{
        type: 'campus' | 'alumni' | null;
        year: number | null;
      }>,
    ) => {
      state.sidePanelType = action.payload.type;
      state.sidePanelYear = action.payload.year;
    },
    setScrollZ: (state, action: PayloadAction<number>) => {
      state.scrollZ = action.payload;
    },
  },
});

export const {
  setLanguage,
  setCurrentYear,
  setPanelActive,
  toggleAutoScroll,
  // MCV Actions
  setHoveredYear,
  setSelectedCategory,
  setSelectedPeriod,
  setTimeRange,
  setSidePanel,
  setScrollZ,
} = siteSlice.actions;
export default siteSlice.reducer;
