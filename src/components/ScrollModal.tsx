import React, { useEffect, useState } from 'react';
import { HistoryEvent } from '@/data/uni_detail';

interface Props {
  data: HistoryEvent | null;
  onClose: () => void;
}

const ScrollModal: React.FC<Props> = ({ data, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (data) {
      // 稍微延迟一点点显示内容，配合进场动画
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [data]);

  if (!data) return null;

  return (
    <div className={`scroll-overlay ${visible ? 'show' : ''}`} onClick={onClose}>
      <div 
        className="scroll-paper" 
        onClick={(e) => e.stopPropagation()} // 防止点击书卷关闭弹窗
      >
        {/* 卷轴左轴 */}
        <div className="scroll-roller left-roller"></div>
        
        {/* 书卷内容区 */}
        <div className="scroll-content-container">
            <div className="scroll-watermark">北洋</div> {/* 水印 */}
            
            <header className="scroll-header">
                <span className="scroll-year">{data.year}</span>
                <h1 className="scroll-title">{data.title}</h1>
            </header>
            
            <div className="scroll-divider">
                <span className="divider-icon">❖</span>
            </div>

            <article className="scroll-text">
                <p className="summary"><strong>【事件概要】</strong> {data.desc}</p>
                <br/>
                <p><strong>【史料记载】</strong></p>
                <p>
                  （此处为模拟详细史料）时维九月，序属三秋。{data.year}年，{data.title}之事起。
                  举校上下，务实求是，在此变局之中开新局。凡我北洋学子，皆以此为勉。
                  {data.desc} 此事对于后续学科发展（{data.majors.map(m=>m.n).join('、')}）产生了深远影响。
                </p>
                <p>
                  据档案记载，当年共有学生{data.student_total}人，毕业后多赴{data.career}。
                  此亦可见当时家国之需与学子之志。校训精神一脉相承，至今未改。
                  巍巍学府，北洋高耸，在此刻留下了浓墨重彩的一笔。
                </p>
            </article>

            <footer className="scroll-footer">
                —— 天津大学（北洋大学）校史档案馆 编 ——
            </footer>
        </div>

        {/* 卷轴右轴 */}
        <div className="scroll-roller right-roller"></div>
        
        {/* 关闭按钮 */}
        <div className="close-seal" onClick={onClose}>阅毕</div>
    </div>
    </div>
  );
};

export default ScrollModal;