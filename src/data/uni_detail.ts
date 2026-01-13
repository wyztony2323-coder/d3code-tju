
export interface MajorItem {
  n: string; // 学科名
  v: number; // 占比或数量
}

export interface HistoryEvent {
  year: number;
  type: string;
  title: string;
  desc: string;
  major_count: number;
  student_total: string;
  career: string;
  majors: MajorItem[];
  isEmpty?: boolean; // 可选字段，用于标记空数据
}

// 导入数据转换函数
import { convertHistographyToHistoryEvents } from './dataLoader';

// 使用新的历史数据，转换为现有格式
export const uniDetailData: HistoryEvent[] = convertHistographyToHistoryEvents();

// 保留原有数据作为后备（如果需要）
export const uniDetailDataLegacy: HistoryEvent[] = [
  {
    "year": 1895,
    "type": "event",
    "title": "北洋大学堂成立",
    "desc": "律例、矿务、土木、机械。",
    "major_count": 4,
    "student_total": "30",
    "career": "官费派往路矿总局",
    "majors": [{"n":"律例", "v":25}, {"n":"矿务", "v":25}, {"n":"土木", "v":25}, {"n":"机械", "v":25}]
  },
  {
    "year": 1917,
    "type": "event",
    "title": "学科大调整",
    "desc": "专攻工科，奠定工学根基。",
    "major_count": 4,
    "student_total": "200",
    "career": "实业救国/工程技师",
    "majors": [{"n":"土木", "v":30}, {"n":"采矿", "v":25}, {"n":"冶金", "v":25}, {"n":"机械", "v":20}]
  },
  {
    "year": 1952,
    "type": "event",
    "title": "院系调整",
    "desc": "确立化工、建筑等核心优势。",
    "major_count": 20,
    "student_total": "1500",
    "career": "国家统配/重工业基地",
    "majors": [{"n":"化工", "v":40}, {"n":"机械", "v":20}, {"n":"土木", "v":20}, {"n":"其他", "v":20}]
  },
  {
    "year": 1995,
    "type": "event",
    "title": "百年华诞",
    "desc": "入选211工程，综合化发展。",
    "major_count": 42,
    "student_total": "2100",
    "career": "科研院所/大型国企",
    "majors": [{"n":"工科", "v":60}, {"n":"理学", "v":15}, {"n":"管理", "v":15}, {"n":"文法", "v":10}]
  },
  {
    "year": 2025,
    "type": "event",
    "title": "新工科领军",
    "desc": "百卅校庆，迈向世界一流。",
    "major_count": 74,
    "student_total": "5200",
    "career": "高新科技/选调深造",
    "majors": [{"n":"新工科", "v":45}, {"n":"医/理", "v":25}, {"n":"经管", "v":20}, {"n":"人文", "v":10}]
  }
];