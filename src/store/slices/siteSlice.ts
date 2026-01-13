import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SiteState {
  language: 'zh' | 'en';
  currentYear: number;
  isPanelActive: boolean;
  autoScroll: boolean;
}

const initialState: SiteState = {
  language: 'zh',
  currentYear: 1895,
  isPanelActive: false,
  autoScroll: true,
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
    }
  },
});

export const { setLanguage, setCurrentYear, setPanelActive, toggleAutoScroll } = siteSlice.actions;
export default siteSlice.reducer;