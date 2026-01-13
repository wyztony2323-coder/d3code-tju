
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import '@/styles/timeline.css'; 
import { uniDetailData, HistoryEvent } from '@/data/uni_detail';
import InfoPanel from './InfoPanel';
import ScrollModal from './ScrollModal';
// 1. 引入新组件
import MajorsOverlay from './MajorsOverlay';
import AlumniGraphModal from './AlumniGraphModal';
import CampusBuildingModal from './CampusBuildingModal';
import { getCampusData, getAlumniData } from '@/data/mockExtensions';
import { CampusInfo, AlumniNetworkData } from '@/types/extensions';

// SVG 滤镜定义：用于发光效果
const GlowFilter: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <filter id="glow-filter">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
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
    title: "", desc: "", student_total: "0", majors: []
  }))
];

interface UniversityHistoryProps {
  onScrollChange?: (scrollZ: number) => void; // 暴露滚动位置给父组件
}

const UniversityHistory: React.FC<UniversityHistoryProps> = ({ onScrollChange }) => {
  const worldRef = useRef<HTMLDivElement>(null);
  
  const [scrollZ, setScrollZ] = useState(0);
  const [modalData, setModalData] = useState<HistoryEvent | null>(null);
  
  // 2. 状态控制底部幕布 (默认展开或收起可在此调整)
  const [isCurtainOpen, setIsCurtainOpen] = useState(true);

  // 3. 新增状态：左右模块
  const [showAlumni, setShowAlumni] = useState(false);
  const [showBuilding, setShowBuilding] = useState(false);
  const [selectedCampusData, setSelectedCampusData] = useState<CampusInfo | null>(null);
  const [selectedAlumniData, setSelectedAlumniData] = useState<AlumniNetworkData | null>(null);

  // ================= 核心：计算 =================
  const liveData = useMemo(() => {
    let rawProgress = (scrollZ) / Z_STEP;
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
    
    const stuCurr = parseInt(currData.student_total || "0") || 0;
    const stuNext = parseInt(nextData.student_total || "0") || 0;
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
          
          setScrollZ(prev => {
            const nextZ = prev + delta;
            const maxZ = ROAD_DATA.length * Z_STEP; 
            const clampedZ = Math.max(-1000, Math.min(nextZ, maxZ));
            
            // 通知父组件滚动位置变化
            if (onScrollChange) {
              onScrollChange(clampedZ);
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

  // ================= 左右模块点击处理（使用 useCallback 优化）=================
  const handleLeftClick = useCallback((year: number) => {
    const buildingData = getCampusData(year);
    if (buildingData) {
      setSelectedCampusData(buildingData);
      setShowBuilding(true);
    }
  }, []);

  const handleRightClick = useCallback((year: number) => {
    const alumniData = getAlumniData(year);
    if (alumniData) {
      setSelectedAlumniData(alumniData);
      setShowAlumni(true);
    }
  }, []);

  return (
    <div className="tju-viewport">
      {/* SVG 滤镜定义：用于发光效果 */}
      <GlowFilter />
      
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
            transform: `translate3d(0, 0, ${scrollZ - INITIAL_Z}px)`
          }}
        >
          {/* @ts-ignore */}
          {visibleIndices.map((index) => {
            const item = ROAD_DATA[index];
            const zPos = -1 * index * Z_STEP;
            // @ts-ignore
            const isFiller = item.isEmpty; 

            return (
              <div 
                key={index} 
                className="year-module-group"
                style={{ transform: `translate3d(0, 0, ${zPos}px)` }}
              >
                <div 
                  className="road-tile" 
                  style={{ height: `${Z_STEP + 2}px`, top: `0px` }}
                />
                {!isFiller && (
                  <>
                    {/* ====== 1. 中央刻度系统 (Timeline Tick) ====== */}
                    <div className="timeline-tick-bar">
                      <div className="year-label">{item.year}</div>
                      <div className="tick-line"></div>
                    </div>

                    {/* ====== 中央路面内容 (Event Title) ====== */}
                    <div className="road-surface-content">
                      <div className="event-text">{item.title}</div>
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
        <div style={{ position: 'fixed', bottom: 20, width: '100%', textAlign: 'center', color: '#00448a', opacity:0.6, fontSize:'12px', letterSpacing:'2px', pointerEvents:'none' }}>
          ▼ 滚动以穿梭时空 · 追溯天大历史 ▼
        </div>
      )}

      {/* 4. 中央弹窗 (最高层级) */}
      <ScrollModal 
        data={modalData} 
        onClose={() => setModalData(null)} 
      />

      {/* 5. 左侧建筑模态框 */}
      <CampusBuildingModal 
        visible={showBuilding} 
        onClose={() => setShowBuilding(false)} 
        data={selectedCampusData} 
      />

      {/* 6. 右侧校友网络模态框 */}
      <AlumniGraphModal 
        visible={showAlumni} 
        onClose={() => setShowAlumni(false)} 
        data={selectedAlumniData} 
      />
    </div>
  );
};

export default UniversityHistory;
