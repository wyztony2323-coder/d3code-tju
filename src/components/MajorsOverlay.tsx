

import React from 'react';
import '@/styles/timeline.css';

// 定义传入的数据结构
interface MajorItem {
  n: string; // 名字
  v: number; // 值
}

interface MajorsOverlayProps {
  data: MajorItem[];   // 传入 liveData.majors
  isOpen: boolean;     // 状态
  onToggle: () => void; // 切换函数
}

// 辅助：为了让柱子看起来比例协调，设置一个虚拟的最大值
// 假设各专业人数最大大概是 50~100 (根据你的 JSON 数据量级调整)
const MAX_VALUE_SCALE = 80; 

const MajorsOverlay: React.FC<MajorsOverlayProps> = ({ data, isOpen, onToggle }) => {
  
  return (
    // 根据 isOpen 决定是否附加 .closed 类
    <div className={`majors-curtain-container ${isOpen ? '' : 'closed'}`}>
      
      {/* 顶部开关按钮 */}
      <button className="curtain-toggle-btn" onClick={onToggle}>
        {isOpen ? (
           <><span>↓</span> 收起学科分布</> 
        ) : (
           <><span>↑</span> 展开学科分布</> 
        )}
      </button>

      {/* 图表主体 */}
      <div className="chart-body">
        {data.map((item, idx) => {
          // 计算高度百分比，最高 100%
          // 防止数据超过最大值溢出容器
          let heightPercent = (item.v / MAX_VALUE_SCALE) * 100;
          if (heightPercent > 100) heightPercent = 100;

          return (
            <div key={idx} className="chart-column">
              {/* 柱子实体 */}
              <div 
                className="chart-bar-fill"
                style={{ height: `${heightPercent}%` }}
              >
                 {/* 数值 (只有非0才显示，不然太乱) */}
                 {item.v > 1 && (
                   <span className="chart-val">{Math.round(item.v)}</span>
                 )}
              </div>
              
              {/* 标签 */}
              <div className="chart-label">{item.n}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MajorsOverlay;


