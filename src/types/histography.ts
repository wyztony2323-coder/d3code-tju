// 历史事件数据接口
export interface HistographyEvent {
  year: number;
  date?: string;
  title: string;
  content: string;
  category: 'FOUNDATION' | 'DISCIPLINES' | 'PEOPLE' | 'HONORS' | 'HISTORY' | 'CAMPUS';
  category_cn: string;
  geo?: {
    lat: number;
    lng: number;
    name: string;
  };
}

// 人口统计数据接口
export interface PopulationStats {
  year: number;
  total_students: number;
  faculty: number;
  note: string;
}

// 学科演变数据接口
export interface DisciplineEvolution {
  year: number;
  major: string;
  event: string;
  desc: string;
  status: 'foundation' | 'evolution' | 'merge_in' | 'merge_out' | 'new_era';
}

// 1952年院系调整流程数据
export interface FlowNode {
  name: string;
  id: number;
}

export interface FlowLink {
  source: number;
  target: number;
  value: number;
  desc?: string;
}

export interface Flow1952 {
  nodes: FlowNode[];
  links: FlowLink[];
}

// 校友网络数据接口
export interface AlumniNode {
  id: string;
  group: number;
  radius?: number;
  role?: string;
}

export interface AlumniLink {
  source: string;
  target: string;
  value: number;
  desc?: string;
}

export interface AlumniNetwork {
  nodes: AlumniNode[];
  links: AlumniLink[];
}

// 学科结构数据接口
export interface AcademicStructure {
  name: string;
  children: AcademicDepartment[];
}

export interface AcademicDepartment {
  name: string;
  children: AcademicUnit[];
}

export interface AcademicUnit {
  name: string;
  value: number;
}
