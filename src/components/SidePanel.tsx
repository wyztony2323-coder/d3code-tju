import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidePanel } from '@/store/slices/siteSlice';
import { getCampusData, getAlumniData } from '@/data/mockExtensions';
import AlumniGraphModal from './AlumniGraphModal';
import CampusBuildingModal from './CampusBuildingModal';
import './SidePanel.css';

/**
 * 侧边面板组件（Dock Panel）
 * 替代Modal，保持3D视图可见，实现并列视图
 */
const SidePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidePanelType, sidePanelYear } = useAppSelector((state) => ({
    sidePanelType: state.site.sidePanelType,
    sidePanelYear: state.site.sidePanelYear,
  }));

  const handleClose = () => {
    dispatch(setSidePanel({ type: null, year: null }));
  };

  if (!sidePanelType || !sidePanelYear) {
    return null;
  }

  const campusData =
    sidePanelType === 'campus' ? getCampusData(sidePanelYear) : null;
  const alumniData =
    sidePanelType === 'alumni' ? getAlumniData(sidePanelYear) : null;

  return (
    <div className={`side-panel side-panel-${sidePanelType}`}>
      <div className="side-panel-header">
        <span className="side-panel-title">
          {sidePanelType === 'campus' ? '校区风貌' : '校友图谱'} -{' '}
          {sidePanelYear}
        </span>
        <button
          className="side-panel-close"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          ×
        </button>
      </div>
      <div className="side-panel-content">
        {sidePanelType === 'campus' && campusData && (
          <CampusBuildingModal
            visible={true}
            onClose={handleClose}
            data={campusData}
            embedded={true}
          />
        )}
        {sidePanelType === 'alumni' && alumniData && (
          <AlumniGraphModal
            visible={true}
            onClose={handleClose}
            data={alumniData}
            embedded={true}
          />
        )}
      </div>
    </div>
  );
};

export default SidePanel;
