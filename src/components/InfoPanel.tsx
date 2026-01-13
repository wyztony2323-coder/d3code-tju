import React, { useEffect, useRef, memo } from 'react';
import * as d3 from 'd3';
// 注意：我们要支持“动态数据”，所以接口里的值类型要宽松一点（不仅是Majors，还得允许临时计算的数据）
import { HistoryEvent, MajorItem } from '@/data/uni_detail';

interface Props {
  // 现在的 data 不是 HistoryEvent，而是一个“计算出来的实时混合状态”
  // 我们复用 HistoryEvent 的结构，但要知道这里面的数字是动态跳动的
  data: HistoryEvent;
}

const InfoPanel: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // 使用 useRef 保持对 D3 选择集的引用，防止每次都清空重建 DOM 造成闪烁
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  // 初始化画布（只执行一次）
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    // 清理（防止热重载残留）
    svg.selectAll("*").remove();

    const width = 140, height = 140;
    
    const g = svg.attr("width", width).attr("height", height)
       .append("g").attr("transform", `translate(${width/2},${height/2})`);
    
    gRef.current = g;
    
    // 初始化时就建好 4 个扇形的占位符（假设数据里最多4个学科类）
    // 这样后续 update 时只需要改属性，不需要重新 append，性能极高
    g.selectAll('path.slice')
      .data([0,1,2,3]) // 预制4个坑位
      .enter()
      .append('path')
      .attr('class', 'slice')
      .attr('stroke', '#fff')
      .attr('stroke-width', '2px');

    // 中间文字
    g.append("text").attr("class", "year-label")
     .attr("text-anchor", "middle").attr("dy", "0.3em")
     .style("font-family", "Times New Roman").style("font-weight", "bold");

  }, []); // 空依赖，只挂载一次

  // 实时更新数据 (高频触发)
  useEffect(() => {
    if (!gRef.current || !data) return;

    // 1. 计算布局
    // 这里的 pie 数据要对应 data.majors 的顺序
    const pie = d3.pie<MajorItem>().value(d => d.v).sort(null);
    const arcsData = pie(data.majors);

    // 2. 弧生成器
    const arc = d3.arc<d3.PieArcDatum<MajorItem>>().innerRadius(40).outerRadius(65);
    const color = d3.scaleOrdinal().range(["#00448a", "#b2955a", "#555555", "#999999"]);

    // 3. 高性能更新：select所有切片并直接改变 d 属性，不要加 transition
    // 因为外部的 scroll 已经在做动画了，这里一定要瞬时响应
    const paths = gRef.current.selectAll('path.slice').data(arcsData);

    paths
      .attr('d', arc as any) // 更新形状
      .attr('fill', (d, i) => color(i.toString()) as string);

    // 4. 更新中间文字
    gRef.current.select('.year-label')
       .text(Math.round(data.year)) // 年份取整显示
       .style("font-size", "28px")
       .style("fill", "#00448a");

  }, [data]); // 只要 data 变了（也就是滚轮动了），这里就刷新

  return (
    <div className="info-panel active-persistent"> {/* 新增 class active-persistent */}
      <div className="panel-header">
         <h2>历史数据概览</h2>
         <small>实时学情监测</small>
      </div>
      
      <div className="chart-section">
         <svg ref={svgRef}></svg>
         {/* 动态图例 */}
         <div className="legend">
            {data.majors.map((m, i) => (
              <div key={i} className="legend-item">
                <span className="dot" style={{background: ["#00448a", "#b2955a", "#555", "#999"][i%4]}}></span>
                {/* 这里的数字我们保留一位小数，显得更“科技/精密” */}
                <span>{m.n} {m.v.toFixed(1)}%</span>
              </div>
            ))}
         </div>
      </div>
      
      <div className="info-grid">
         <div className="info-item">
            <label>当前在校生 (估)</label>
            {/* 学生数也是插值算出来的 */}
            <strong style={{fontSize: 24, color: '#b2955a'}}>{Math.round(Number(data.student_total))}</strong>
         </div>
         <div className="info-item">
            <label>阶段特征</label>
            <strong style={{fontSize: 12}}>{data.title}</strong>
         </div>
      </div>
    </div>
  );
};

export default memo(InfoPanel);