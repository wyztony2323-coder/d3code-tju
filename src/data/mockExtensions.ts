import { CampusInfo, AlumniNetworkData } from '@/types/extensions';
import { getCampusDataFromHistography, getAlumniDataFromNetwork } from './dataLoader';

// Mock 建筑数据（保留作为后备）
export const mockCampusData: Record<number, CampusInfo> = {
  1895: {
    year: 1895,
    name: '北洋大学堂旧址',
    description: '1895年，北洋大学堂在天津成立，这是中国第一所现代大学。建筑采用中西合璧风格，体现了当时的教育理念。',
    imageUrl: 'https://via.placeholder.com/600x400/00448a/ffffff?text=北洋大学堂旧址'
  },
  1917: {
    year: 1917,
    name: '北洋大学工学院',
    description: '1917年学科调整后，北洋大学专攻工科，工学院建筑群拔地而起，奠定了工学教育的坚实基础。',
    imageUrl: 'https://via.placeholder.com/600x400/00448a/ffffff?text=工学院建筑群'
  },
  1952: {
    year: 1952,
    name: '天津大学新校区',
    description: '1952年院系调整后，天津大学确立了化工、建筑等核心优势学科，新校区建设体现了现代化教育理念。',
    imageUrl: 'https://via.placeholder.com/600x400/00448a/ffffff?text=1952年新校区'
  },
  1995: {
    year: 1995,
    name: '天津大学百年校庆建筑群',
    description: '1995年，天津大学迎来百年校庆，新建了多座标志性建筑，展现了百年学府的历史底蕴与现代活力。',
    imageUrl: 'https://via.placeholder.com/600x400/00448a/ffffff?text=百年校庆建筑群'
  }
};

// Mock 校友网络数据
export const mockAlumniData: Record<number, AlumniNetworkData> = {
  1895: {
    year: 1895,
    nodes: [
      { id: '1', name: '茅以升', group: 'distinguished', value: 20 },
      { id: '2', name: '王宠惠', group: 'distinguished', value: 15 },
      { id: '3', name: '张太雷', group: 'distinguished', value: 18 },
      { id: '4', name: '毕业生A', group: 'graduate', value: 5 },
      { id: '5', name: '毕业生B', group: 'graduate', value: 5 },
      { id: '6', name: '毕业生C', group: 'graduate', value: 5 }
    ],
    links: [
      { source: '1', target: '4', value: 1 },
      { source: '1', target: '5', value: 1 },
      { source: '2', target: '6', value: 1 },
      { source: '3', target: '4', value: 1 }
    ]
  },
  1917: {
    year: 1917,
    nodes: [
      { id: '1', name: '茅以升', group: 'distinguished', value: 25 },
      { id: '2', name: '侯德榜', group: 'distinguished', value: 22 },
      { id: '3', name: '马寅初', group: 'distinguished', value: 20 },
      { id: '4', name: '毕业生A', group: 'graduate', value: 5 },
      { id: '5', name: '毕业生B', group: 'graduate', value: 5 },
      { id: '6', name: '毕业生C', group: 'graduate', value: 5 },
      { id: '7', name: '毕业生D', group: 'graduate', value: 5 }
    ],
    links: [
      { source: '1', target: '2', value: 2 },
      { source: '1', target: '4', value: 1 },
      { source: '2', target: '5', value: 1 },
      { source: '3', target: '6', value: 1 },
      { source: '1', target: '7', value: 1 }
    ]
  },
  1952: {
    year: 1952,
    nodes: [
      { id: '1', name: '侯德榜', group: 'distinguished', value: 30 },
      { id: '2', name: '张含英', group: 'distinguished', value: 25 },
      { id: '3', name: '毕业生A', group: 'graduate', value: 5 },
      { id: '4', name: '毕业生B', group: 'graduate', value: 5 },
      { id: '5', name: '毕业生C', group: 'graduate', value: 5 },
      { id: '6', name: '毕业生D', group: 'graduate', value: 5 },
      { id: '7', name: '毕业生E', group: 'graduate', value: 5 }
    ],
    links: [
      { source: '1', target: '2', value: 3 },
      { source: '1', target: '3', value: 1 },
      { source: '1', target: '4', value: 1 },
      { source: '2', target: '5', value: 1 },
      { source: '2', target: '6', value: 1 },
      { source: '1', target: '7', value: 1 }
    ]
  },
  1995: {
    year: 1995,
    nodes: [
      { id: '1', name: '杰出校友A', group: 'distinguished', value: 20 },
      { id: '2', name: '杰出校友B', group: 'distinguished', value: 18 },
      { id: '3', name: '毕业生A', group: 'graduate', value: 5 },
      { id: '4', name: '毕业生B', group: 'graduate', value: 5 },
      { id: '5', name: '毕业生C', group: 'graduate', value: 5 }
    ],
    links: [
      { source: '1', target: '2', value: 2 },
      { source: '1', target: '3', value: 1 },
      { source: '2', target: '4', value: 1 },
      { source: '1', target: '5', value: 1 }
    ]
  }
};

// 获取建筑数据的辅助函数（优先使用新数据）
export const getCampusData = (year: number): CampusInfo | null => {
  // 优先从历史数据中获取
  const histographyData = getCampusDataFromHistography(year);
  if (histographyData) {
    return histographyData;
  }
  // 后备使用mock数据
  return mockCampusData[year] || null;
};

// 获取校友数据的辅助函数（优先使用新数据）
export const getAlumniData = (year: number): AlumniNetworkData | null => {
  // 优先从校友网络数据中获取
  const networkData = getAlumniDataFromNetwork(year);
  if (networkData) {
    return networkData;
  }
  // 后备使用mock数据
  return mockAlumniData[year] || null;
};
