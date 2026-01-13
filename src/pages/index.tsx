import React, { useState } from 'react';
import UniversityHistory from '@/components/UniversityHistory';
import HistoryEnvironment from '@/components/HistoryEnvironment';
import '@/styles/timeline.css';

export default function HomePage() {
  const [scrollZ, setScrollZ] = useState(0);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* 3D 背景层：传入滚动值 */}
      <HistoryEnvironment scrollZ={scrollZ} />

      
      {/* 原有的前景 UI 层 */}
      <UniversityHistory onScrollChange={setScrollZ} />

      {/* 底部提示 */}
    </div>
  );
}
