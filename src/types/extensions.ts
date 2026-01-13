// 建筑/校区信息
export interface CampusInfo {
  year: number;
  name: string; // 如：北洋大学堂旧址
  description: string;
  imageUrl: string; // 图片路径
}

// 校友/毕业生节点
export interface AlumniNode {
  id: string;
  name: string;
  group: 'graduate' | 'distinguished'; // 普通毕业生 vs 杰出校友
  value: number; // 影响力或权重
}

export interface AlumniLink {
  source: string;
  target: string;
  value: number;
}

export interface AlumniNetworkData {
  year: number;
  nodes: AlumniNode[];
  links: AlumniLink[];
}
