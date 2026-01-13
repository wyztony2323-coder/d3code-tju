// 专业分布数据结构
export interface MajorDistribution {
    n: string; // name
    v: number; // value (percent)
}

// 核心历史事件结构 (对应 uni_detail.json)
export interface TJUHistoryEvent {
    year: number;
    // 渲染时生成的属性
    type?: 'mark' | 'event'; 
    title?: string;
    desc?: string;
    major_count?: number;
    student_total?: string;
    career?: string;
    majors?: MajorDistribution[];
    
    // 3D 空间属性 (运行时计算)
    x?: number;
    z?: number;
    yOffset?: number;
}