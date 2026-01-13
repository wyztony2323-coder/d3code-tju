import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedCategory,
  setSelectedPeriod,
  EventCategory,
  HistoricalPeriod,
} from '@/store/slices/siteSlice';
import './FilterBar.css';

/**
 * 筛选器组件
 * 支持按事件分类和历史时期筛选
 */
const FilterBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedCategory, selectedPeriod } = useAppSelector((state) => ({
    selectedCategory: state.site.selectedCategory,
    selectedPeriod: state.site.selectedPeriod,
  }));

  const categories: { value: EventCategory; label: string; color: string }[] = [
    { value: 'all', label: '全部', color: '#999' },
    { value: 'politics', label: '政治事件', color: '#ff4444' },
    { value: 'academic', label: '学术突破', color: '#4444ff' },
    { value: 'campus', label: '校园建设', color: '#44ff44' },
    { value: 'discipline', label: '学科调整', color: '#ffaa44' },
  ];

  const periods: { value: HistoricalPeriod; label: string }[] = [
    { value: 'all', label: '全部时期' },
    { value: 'founding', label: '建校初期 (1895-1911)' },
    { value: 'republic', label: '民国时期 (1912-1937)' },
    { value: 'war', label: '抗战西迁 (1937-1945)' },
    { value: 'adjustment', label: '院系调整 (1949-1952)' },
    { value: 'reform', label: '改革开放 (1978-今)' },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">事件分类：</span>
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`filter-btn ${
              selectedCategory === cat.value ? 'active' : ''
            }`}
            style={{
              borderColor: cat.color,
              backgroundColor:
                selectedCategory === cat.value ? cat.color : 'transparent',
            }}
            onClick={() => dispatch(setSelectedCategory(cat.value))}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="filter-group">
        <span className="filter-label">历史时期：</span>
        <select
          className="filter-select"
          value={selectedPeriod}
          onChange={(e) =>
            dispatch(setSelectedPeriod(e.target.value as HistoricalPeriod))
          }
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
