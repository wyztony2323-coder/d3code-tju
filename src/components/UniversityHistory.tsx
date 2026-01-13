import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import '@/styles/timeline.css';
import { uniDetailData, HistoryEvent } from '@/data/uni_detail';
import InfoPanel from './InfoPanel';
import ScrollModal from './ScrollModal';
// 1. 引入新组件
import MajorsOverlay from './MajorsOverlay';
// Modal组件已改为SidePanel，不再需要直接导入
import OverviewBar from './OverviewBar';
import SidePanel from './SidePanel';
import FilterBar from './FilterBar';
import { getCampusData, getAlumniData } from '@/data/mockExtensions';
import { CampusInfo, AlumniNetworkData } from '@/types/extensions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setHoveredYear,
  setSidePanel,
  setCurrentYear,
  setScrollZ as setScrollZAction,
  EventCategory,
  HistoricalPeriod,
} from '@/store/slices/siteSlice';

// SVG 滤镜定义：用于发光效果
const GlowFilter: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <filter id="glow-filter">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

// ================= 常量配置 =================
const Z_STEP = 1200;
const INITIAL_Z = 600;
const SCROLL_SPEED = 3.5;

// 生成伪随机数的辅助函数 (保证同一年份每次刷新形状都一样，不会乱闪)
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const ROAD_DATA = [
  ...uniDetailData,
  ...Array.from({ length: 8 }).map((_, i) => ({
    year: 2025 + (i + 1) * 10,
    isEmpty: true,
    title: '',
    desc: '',
    student_total: '0',
    majors: [],
  })),
];

interface UniversityHistoryProps {
  onScrollChange?: (scrollZ: number) => void; // 暴露滚动位置给父组件
}

const UniversityHistory: React.FC<UniversityHistoryProps> = ({
  onScrollChange,
}) => {
  const dispatch = useAppDispatch();
  const worldRef = useRef<HTMLDivElement>(null);

  // Redux状态
  const {
    selectedCategory,
    selectedPeriod,
    hoveredYear,
    sidePanelType,
    currentYear,
    scrollZ: scrollZFromStore,
  } = useAppSelector((state) => state.site);

  // 本地 scrollZ 用于滚轮事件，同时同步到 Redux
  const [scrollZ, setScrollZ] = useState(scrollZFromStore);

  // 同步 Redux 的 scrollZ 到本地（用于时间轴拖动）
  useEffect(() => {
    if (scrollZFromStore !== scrollZ) {
      setScrollZ(scrollZFromStore);
    }
  }, [scrollZFromStore]);
  const [modalData, setModalData] = useState<HistoryEvent | null>(null);

  // 2. 状态控制底部幕布 (默认展开或收起可在此调整)
  const [isCurtainOpen, setIsCurtainOpen] = useState(true);

  // ================= 核心：计算 =================
  const liveData = useMemo(() => {
    let rawProgress = scrollZ / Z_STEP;
    rawProgress = Math.max(0, Math.min(rawProgress, uniDetailData.length - 1));

    const indexCurrent = Math.floor(rawProgress);
    const indexNext = Math.min(indexCurrent + 1, uniDetailData.length - 1);
    const percent = rawProgress - indexCurrent;

    const currData = uniDetailData[indexCurrent];
    const nextData = uniDetailData[indexNext];

    // UI 显示: 就近原则
    const isCloserToNext = percent > 0.5;
    const currentDisplayData = isCloserToNext ? nextData : currData;

    // 数据插值: 线性计算
    const mixYear = currData.year + (nextData.year - currData.year) * percent;

    const stuCurr = parseInt(currData.student_total || '0') || 0;
    const stuNext = parseInt(nextData.student_total || '0') || 0;
    const mixStu = stuCurr + (stuNext - stuCurr) * percent;

    const mixMajors = currData.majors.map((m, i) => {
      const startVal = m.v;
      // @ts-ignore (为了兼容不同长度的学科数组)
      const endDataMajor = nextData.majors[i];
      const endVal = endDataMajor ? endDataMajor.v : startVal;
      return { n: m.n, v: startVal + (endVal - startVal) * percent };
    });

    return {
      displayTitle: currentDisplayData.title,
      displayDesc: currentDisplayData.desc,
      displayYear: currentDisplayData.year,
      sourceObject: currentDisplayData as HistoryEvent,
      year: mixYear,
      student_total: Math.round(mixStu).toString(),
      majors: mixMajors, // 这里计算出的数组将传递给幕布
    };
  }, [scrollZ]);

  // ================= 滚轮事件（性能优化：使用 requestAnimationFrame 节流）=================
  const rafRef = useRef<number | null>(null);
  const pendingDeltaRef = useRef<number>(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      pendingDeltaRef.current += e.deltaY * SCROLL_SPEED;

      // 如果已经有待处理的帧，不重复请求
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          const delta = pendingDeltaRef.current;
          pendingDeltaRef.current = 0;
          rafRef.current = null;

          setScrollZ((prev) => {
            const nextZ = prev + delta;
            const maxZ = ROAD_DATA.length * Z_STEP;
            const clampedZ = Math.max(-1000, Math.min(nextZ, maxZ));

            // 同步到 Redux（用于时间轴拖动联动）
            dispatch(setScrollZAction(clampedZ));

            // 通知父组件滚动位置变化（用于3D环境同步）
            if (onScrollChange) {
              onScrollChange(clampedZ);
            }

            // 立即更新当前年份（不等待 useEffect）
            const rawProgress = clampedZ / Z_STEP;
            const indexCurrent = Math.floor(
              Math.max(0, Math.min(rawProgress, uniDetailData.length - 1)),
            );
            if (
              uniDetailData[indexCurrent] &&
              !uniDetailData[indexCurrent].isEmpty
            ) {
              const year = uniDetailData[indexCurrent].year;
              dispatch(setCurrentYear(year));
            }

            return clampedZ;
          });
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [onScrollChange]);

  // ================= 虚拟滚动：只渲染可见区域 =================
  const VISIBLE_RANGE = 3; // 前后各渲染3个模块
  const visibleIndices = useMemo(() => {
    const currentIndex = Math.floor(scrollZ / Z_STEP);
    const start = Math.max(0, currentIndex - VISIBLE_RANGE);
    const end = Math.min(ROAD_DATA.length - 1, currentIndex + VISIBLE_RANGE);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [scrollZ]);

  // ================= 辅助函数：事件分类映射 =================
  const getEventCategory = (
    event: HistoryEvent | { isEmpty?: boolean },
  ): EventCategory => {
    if ('isEmpty' in event && event.isEmpty) return 'all';
    const type = (event as HistoryEvent).type?.toLowerCase() || '';
    if (type.includes('foundation') || type.includes('politics'))
      return 'politics';
    if (type.includes('academic') || type.includes('research'))
      return 'academic';
    if (type.includes('campus') || type.includes('building')) return 'campus';
    if (type.includes('discipline') || type.includes('major'))
      return 'discipline';
    return 'all';
  };

  const getHistoricalPeriod = (year: number): HistoricalPeriod => {
    if (year >= 1895 && year <= 1911) return 'founding';
    if (year >= 1912 && year <= 1937) return 'republic';
    if (year >= 1937 && year <= 1945) return 'war';
    if (year >= 1949 && year <= 1952) return 'adjustment';
    if (year >= 1978) return 'reform';
    return 'all';
  };

  // ================= 筛选逻辑 =================
  const filteredData = useMemo(() => {
    return ROAD_DATA.filter((item) => {
      if (item.isEmpty) return true;

      // 分类筛选
      if (selectedCategory !== 'all') {
        const eventCategory = getEventCategory(item);
        if (eventCategory !== selectedCategory) return false;
      }

      // 时期筛选
      if (selectedPeriod !== 'all') {
        const period = getHistoricalPeriod(item.year);
        if (period !== selectedPeriod) return false;
      }

      return true;
    });
  }, [selectedCategory, selectedPeriod]);

  // ================= 视觉编码：颜色和大小 =================
  const getEventColor = (
    event: HistoryEvent | { isEmpty?: boolean },
  ): string => {
    if ('isEmpty' in event && event.isEmpty) return '#00448a';
    const category = getEventCategory(event);
    const colorMap: Record<EventCategory, string> = {
      all: '#00448a',
      politics: '#ff4444',
      academic: '#4444ff',
      campus: '#44ff44',
      discipline: '#ffaa44',
    };
    return colorMap[category] || colorMap.all;
  };

  const getEventSize = (
    event: HistoryEvent | { isEmpty?: boolean },
  ): number => {
    if ('isEmpty' in event && event.isEmpty) return 1;
    // 根据学生总数计算重要性（大小）
    const studentCount =
      parseInt((event as HistoryEvent).student_total || '0') || 0;
    const baseSize = 1;
    const scale = Math.min(1 + studentCount / 10000, 2); // 最大2倍
    return baseSize * scale;
  };

  // ================= 左右模块点击处理（使用Redux）=================
  const handleLeftClick = useCallback(
    (year: number) => {
      dispatch(setSidePanel({ type: 'campus', year }));
    },
    [dispatch],
  );

  const handleRightClick = useCallback(
    (year: number) => {
      dispatch(setSidePanel({ type: 'alumni', year }));
    },
    [dispatch],
  );

  // ================= 滚动时更新当前年份 =================
  useEffect(() => {
    // 根据 scrollZ 计算当前年份
    const rawProgress = scrollZ / Z_STEP;
    const indexCurrent = Math.floor(
      Math.max(0, Math.min(rawProgress, uniDetailData.length - 1)),
    );
    if (uniDetailData[indexCurrent] && !uniDetailData[indexCurrent].isEmpty) {
      const year = uniDetailData[indexCurrent].year;
      // 只有当年份真正改变时才更新，避免频繁更新
      if (year !== currentYear) {
        dispatch(setCurrentYear(year));
      }
    }
  }, [scrollZ, currentYear, dispatch]);

  // ================= 时间范围联动：仅用于筛选，不锁定滚动 =================
  // 移除自动跳转逻辑，时间范围只用于筛选显示哪些年份

  return (
    <div className={`tju-viewport ${sidePanelType ? 'side-panel-open' : ''}`}>
      {/* SVG 滤镜定义：用于发光效果 */}
      <GlowFilter />

      {/* MCV 新增组件 */}
      <FilterBar />
      <OverviewBar />
      <SidePanel />

      {/* 中央标题 - 已隐藏 */}
      {/* <div className="main-title">
        <h1 className="title-text">天津大学 / 北洋大学历史长卷</h1>
      </div> */}

      {/* 3D 舞台 */}
      <div className="scene-3d">
        <div
          className="world-group"
          ref={worldRef}
          style={{
            // 性能优化：使用 translate3d 触发 GPU 加速
            transform: `translate3d(0, 0, ${scrollZ - INITIAL_Z}px)`,
          }}
        >
          {/* @ts-ignore */}
          {visibleIndices.map((index) => {
            const item = ROAD_DATA[index];
            const zPos = -1 * index * Z_STEP;
            // @ts-ignore
            const isFiller = item.isEmpty;

            // MCV: 检查是否通过筛选
            const isFiltered =
              !isFiller && filteredData.some((d) => d.year === item.year);
            const isDimmed = !isFiller && !isFiltered;

            // MCV: 视觉编码
            const eventColor = !isFiller ? getEventColor(item) : '#00448a';
            const eventSize = !isFiller ? getEventSize(item) : 1;
            const isHovered = hoveredYear === item.year;

            return (
              <div
                key={index}
                className={`year-module-group ${isDimmed ? 'dimmed' : ''} ${
                  isHovered ? 'hovered' : ''
                }`}
                style={{
                  transform: `translate3d(0, 0, ${zPos}px) scale(${
                    isHovered ? 1.1 : eventSize
                  })`,
                  opacity: isDimmed ? 0.2 : 1,
                }}
                onMouseEnter={() =>
                  !isFiller && dispatch(setHoveredYear(item.year))
                }
                onMouseLeave={() => dispatch(setHoveredYear(null))}
              >
                <div
                  className="road-tile"
                  style={{
                    height: `${Z_STEP + 2}px`,
                    top: `0px`,
                    borderColor: eventColor,
                  }}
                />
                {!isFiller && (
                  <>
                    {/* ====== 1. 中央刻度系统 (Timeline Tick) ====== */}
                    <div
                      className="timeline-tick-bar"
                      style={{
                        color: eventColor,
                        borderColor: eventColor,
                      }}
                    >
                      <div className="year-label" style={{ color: eventColor }}>
                        {item.year}
                      </div>
                      <div
                        className="tick-line"
                        style={{ backgroundColor: eventColor }}
                      ></div>
                    </div>

                    {/* ====== 中央路面内容 (Event Title) ====== */}
                    <div className="road-surface-content">
                      <div className="event-text" style={{ color: eventColor }}>
                        {item.title}
                      </div>
                    </div>

                    {/* ====== 2. 左侧模块系统 ====== */}
                    <div className="side-system left-system">
                      {/* 连接光束 */}
                      <div className="connection-beam"></div>

                      {/* 独立浮岛面板 */}
                      <div
                        className="info-island island-history"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeftClick(item.year);
                        }}
                      >
                        <div className="island-inner">
                          <span className="island-icon">🏛️</span>
                          <div className="island-info">
                            <span className="island-title">校区风貌</span>
                            <span className="island-sub">View Campus</span>
                          </div>
                        </div>
                        {/* 底部倒影/投影装饰 */}
                        <div className="island-reflection"></div>
                      </div>
                    </div>

                    {/* ====== 3. 右侧模块系统 ====== */}
                    <div className="side-system right-system">
                      {/* 连接光束 */}
                      <div className="connection-beam"></div>

                      {/* 独立浮岛面板 */}
                      <div
                        className="info-island island-alumni"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRightClick(item.year);
                        }}
                      >
                        <div className="island-inner">
                          <span className="island-icon">🎓</span>
                          <div className="island-info">
                            <span className="island-title">校友图谱</span>
                            <span className="island-sub">Alumni Network</span>
                          </div>
                        </div>
                        {/* 底部倒影/投影装饰 */}
                        <div className="island-reflection"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------- UI LAYERS (z-index 越高放越下面) --------------------- */}

      {/* 1. 左上角固定面板 (Main Info) */}
      <div className="fixed-left-panel">
        <div className="fixed-header">
          <h2 className="fixed-title">{liveData.displayTitle}</h2>
          <span className="fixed-year">{liveData.displayYear}</span>
        </div>
        <p className="fixed-desc">{liveData.displayDesc}</p>
        <button
          className="read-more-btn"
          onClick={() => setModalData(liveData.sourceObject)}
        >
          📖 查阅详细史料
        </button>
      </div>

      {/* 2. 右上角统计面板 (原有) */}
      <InfoPanel data={liveData as any} />

      {/* 3. 底部动态专业幕布 (✨ New Integration) */}
      <MajorsOverlay
        data={liveData.majors}
        isOpen={isCurtainOpen}
        onToggle={() => setIsCurtainOpen(!isCurtainOpen)}
      />

      {/* 底部小提示 (只有当幕布关闭时看起来比较明显，不然被遮挡一部分) */}
      {!isCurtainOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            width: '100%',
            textAlign: 'center',
            color: '#00448a',
            opacity: 0.6,
            fontSize: '12px',
            letterSpacing: '2px',
            pointerEvents: 'none',
          }}
        >
          ▼ 滚动以穿梭时空 · 追溯天大历史 ▼
        </div>
      )}

      {/* 4. 中央弹窗 (最高层级) */}
      <ScrollModal data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
};

export default UniversityHistory;
