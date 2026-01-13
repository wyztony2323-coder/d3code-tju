import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import * as d3 from 'd3';
import { AlumniNetworkData } from '@/types/extensions';

interface Props {
  visible: boolean;
  onClose: () => void;
  data: AlumniNetworkData | null;
}

const AlumniGraphModal: React.FC<Props> = ({ visible, onClose, data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!visible || !data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 清除旧图表

    const width = 800;
    const height = 600;

    // 设置 SVG 尺寸
    svg.attr("width", width).attr("height", height);

    // 1. 初始化模拟器
    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 2. 绘制连线
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // 3. 绘制节点
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d) => d.group === 'distinguished' ? 15 : 5)
      .attr("fill", (d) => d.group === 'distinguished' ? "#d9363e" : "#1890ff") // 杰出校友红色，普通蓝色
      .call(drag(simulation) as any);

    // 4. 添加标签
    const labels = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.name)
      .attr("font-size", (d) => d.group === 'distinguished' ? "12px" : "10px")
      .attr("dx", 18)
      .attr("dy", 4);

    // 5. 更新逻辑
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // 拖拽辅助函数
    function drag(simulation: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

  }, [visible, data]);

  return (
    <Modal
      title={`${data?.year || ''} 年毕业生分布与杰出校友网络`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={850}
      bodyStyle={{ background: '#f0f2f5' }}
    >
      <svg ref={svgRef} width="800" height="600" style={{ background: '#fff', display: 'block' }} />
    </Modal>
  );
};

export default AlumniGraphModal;
