// 数据加载和转换模块
import { HistoryEvent, MajorItem } from './uni_detail';
import { 
  HistographyEvent, 
  PopulationStats, 
  DisciplineEvolution,
  Flow1952,
  AlumniNetwork,
  AcademicStructure
} from '@/types/histography';
import { CampusInfo, AlumniNetworkData } from '@/types/extensions';

// 导入JSON数据（umi支持JSON导入）
// @ts-ignore
import histographyData from '../../data/tju_histography_data.json';
// @ts-ignore
import populationStats from '../../data/stats_population.json';
// @ts-ignore
import disciplineEvolution from '../../data/discipline_evolution.json';
// @ts-ignore
import flow1952 from '../../data/flow_1952.json';
// @ts-ignore
import alumniNetwork from '../../data/alumni_network.json';
// @ts-ignore
import academicStructure from '../../data/structure_academics.json';

// 将历史事件数据转换为现有格式
export function convertHistographyToHistoryEvents(): HistoryEvent[] {
  const statsMap = new Map<number, PopulationStats>();
  (populationStats as PopulationStats[]).forEach(stat => {
    statsMap.set(stat.year, stat);
  });

  const disciplineMap = new Map<number, DisciplineEvolution[]>();
  (disciplineEvolution as DisciplineEvolution[]).forEach(discipline => {
    if (!disciplineMap.has(discipline.year)) {
      disciplineMap.set(discipline.year, []);
    }
    disciplineMap.get(discipline.year)!.push(discipline);
  });

  // 按年份分组历史事件
  const eventsByYear = new Map<number, HistographyEvent[]>();
  (histographyData as HistographyEvent[]).forEach(event => {
    if (!eventsByYear.has(event.year)) {
      eventsByYear.set(event.year, []);
    }
    eventsByYear.get(event.year)!.push(event);
  });

  // 转换为HistoryEvent格式
  const result: HistoryEvent[] = [];
  eventsByYear.forEach((events, year) => {
    // 找到该年份的主要事件（通常是第一个，或者FOUNDATION/CAMPUS类型）
    const mainEvent = events.find(e => 
      e.category === 'FOUNDATION' || 
      e.category === 'CAMPUS' || 
      e.category === 'DISCIPLINES'
    ) || events[0];

    // 获取该年份的统计数据
    const stats = statsMap.get(year);
    
    // 获取该年份的学科数据
    const disciplines = disciplineMap.get(year) || [];
    
    // 转换为majors格式
    let majors: MajorItem[] = [];
    if (disciplines.length > 0) {
      const validDisciplines = disciplines.filter(d => d.status !== 'merge_out');
      if (validDisciplines.length > 0) {
        majors = validDisciplines.map(d => {
          // 提取中文名称（去掉英文部分）
          const chineseName = d.major.split('(')[0].trim();
          return {
            n: chineseName || d.major,
            v: Math.round(100 / validDisciplines.length)
          };
        });
        // 确保总和为100
        const total = majors.reduce((sum, m) => sum + m.v, 0);
        if (total !== 100 && majors.length > 0) {
          majors[0].v += (100 - total);
        }
      }
    }
    
    // 如果没有学科数据，使用默认值
    if (majors.length === 0) {
      majors.push({ n: '综合', v: 100 });
    }

    result.push({
      year: year,
      type: mainEvent.category.toLowerCase(),
      title: mainEvent.title,
      desc: mainEvent.content,
      major_count: majors.length,
      student_total: stats?.total_students.toString() || '0',
      career: stats?.note || '继续深造',
      majors: majors,
      isEmpty: false // 标记为非空数据
    });
  });

  // 按年份排序
  return result.sort((a, b) => a.year - b.year);
}

// 获取指定年份的人口统计数据
export function getPopulationStats(year: number): PopulationStats | null {
  const stats = (populationStats as PopulationStats[]).find(s => s.year === year);
  return stats || null;
}

// 获取指定年份的学科演变数据
export function getDisciplineEvolution(year: number): DisciplineEvolution[] {
  return (disciplineEvolution as DisciplineEvolution[]).filter(d => d.year === year);
}

// 获取1952年院系调整流程数据
export function getFlow1952(): Flow1952 {
  return flow1952 as Flow1952;
}

// 获取校友网络数据
export function getAlumniNetwork(): AlumniNetwork {
  return alumniNetwork as AlumniNetwork;
}

// 获取学科结构数据
export function getAcademicStructure(): AcademicStructure {
  return academicStructure as AcademicStructure;
}

// 根据年份和历史事件数据生成建筑信息
export function getCampusDataFromHistography(year: number): CampusInfo | null {
  const events = (histographyData as HistographyEvent[]).filter(e => e.year === year);
  const campusEvent = events.find(e => e.category === 'CAMPUS' && e.geo);
  
  if (campusEvent && campusEvent.geo) {
    return {
      year: year,
      name: campusEvent.geo.name,
      description: campusEvent.content,
      imageUrl: `https://via.placeholder.com/600x400/00448a/ffffff?text=${encodeURIComponent(campusEvent.geo.name)}`
    };
  }
  
  return null;
}

// 根据年份和校友网络数据生成校友网络数据
export function getAlumniDataFromNetwork(year: number): AlumniNetworkData | null {
  const network = getAlumniNetwork();
  
  // 根据年份筛选相关校友（这里简化处理，实际可以根据年份映射）
  // 可以扩展为按年份返回不同的校友网络
  const nodes = network.nodes.map(node => ({
    id: node.id,
    name: node.id === 'TJU' ? '天津大学' : node.id,
    group: node.group === 0 ? 'distinguished' : node.group === 1 ? 'distinguished' : 'graduate',
    value: node.radius || 10
  }));

  const links = network.links.map(link => ({
    source: link.source,
    target: link.target,
    value: link.value
  }));

  return {
    year: year,
    nodes: nodes,
    links: links
  };
}

// 合并后的数据加载函数
export function loadAllData(): {
  historyEvents: HistoryEvent[];
  populationStats: PopulationStats[];
  disciplineEvolution: DisciplineEvolution[];
  flow1952: Flow1952;
  alumniNetwork: AlumniNetwork;
  academicStructure: AcademicStructure;
} {
  return {
    historyEvents: convertHistographyToHistoryEvents(),
    populationStats: populationStats as PopulationStats[],
    disciplineEvolution: disciplineEvolution as DisciplineEvolution[],
    flow1952: flow1952 as Flow1952,
    alumniNetwork: alumniNetwork as AlumniNetwork,
    academicStructure: academicStructure as AcademicStructure
  };
}
