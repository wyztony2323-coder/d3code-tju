import { configureStore } from '@reduxjs/toolkit';
import siteReducer from './slices/siteSlice';

export const store = configureStore({
  reducer: {
    site: siteReducer,
  },
});

// 导出类型供 Hooks 使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;