// src/App.tsx
import React from 'react';
import UniversityHistory from './components/UniversityHistory';
import './styles/timeline.css';

function App() {
  return (
    <div className="App">
      {/* 顶部标题（可选，可参考标杆项目的 Headings.tsx） */}
      
      {/* 核心 3D 渲染组件 */}
      <UniversityHistory />

      
    </div>
  );
}

export default App;