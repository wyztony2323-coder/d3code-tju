import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { uniDetailData } from '@/data/uni_detail';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentYear, setScrollZ } from '@/store/slices/siteSlice';
import './OverviewBar.css';

/**
 * 底部时间轴概览组件（Overview Bar）
 * 支持拖动滑块滚动主视图
 */
const OverviewBar: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const { currentYear, scrollZ } = useAppSelector((state) => ({
    currentYear: state.site.currentYear,
    scrollZ: state.site.scrollZ,
  }));

  const Z_STEP = 1200; // 与 UniversityHistory 保持一致

  // 准备数据：按年份统计学生总数作为Y轴
  const chartData = useMemo(() => {
    return uniDetailData
      .filter((item) => !item.isEmpty)
      .map((item) => ({
        year: item.year,
        value: parseInt(item.student_total || '0') || 0,
      }))
      .sort((a, b) => a.year - b.year);
  }, []);

  const minYear = Math.min(...chartData.map((d) => d.year));
  const maxYear = Math.max(...chartData.map((d) => d.year));

  // margin 需要在组件作用域内定义，以便在多个地方使用
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X轴：年份
    const xScale = d3
      .scaleLinear()
      .domain([minYear, maxYear])
      .range([0, width]);

    // Y轴：学生总数
    const maxValue = d3.max(chartData, (d) => d.value) || 1000;
    const yScale = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);

    // 绘制折线
    const line = d3
      .line<{ year: number; value: number }>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // 绘制折线图
    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#00448a')
      .attr('stroke-width', 2)
      .attr('d', line);

    // 绘制数据点
    g.selectAll('.dot')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 3)
      .attr('fill', '#00448a')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // 点击跳转到对应年份
        const targetIndex = chartData.findIndex((item) => item.year >= d.year);
        if (targetIndex >= 0) {
          const targetZ = targetIndex * Z_STEP;
          dispatch(setScrollZ(targetZ));
          dispatch(setCurrentYear(d.year));
        }
      });

    // 高亮当前年份
    const currentX = xScale(currentYear);
    g.append('line')
      .attr('class', 'current-year-line')
      .attr('x1', currentX)
      .attr('x2', currentX)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#b2955a')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // X轴
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#fff');

    // Y轴
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#fff');
  }, [chartData, minYear, maxYear, currentYear, dispatch, Z_STEP, margin]);

  return (
    <div className="overview-bar-container">
      <div className="overview-bar-header">
        <span className="overview-title">时间轴概览</span>
        <span className="overview-hint">拖动滑块或点击数据点跳转</span>
      </div>
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <svg ref={svgRef} className="overview-svg" />
        {/* 可拖动的滚动滑块 */}
        <TimelineSlider
          containerRef={containerRef}
          minYear={minYear}
          maxYear={maxYear}
          currentYear={currentYear}
          margin={margin}
          onDrag={(year) => {
            // 根据年份平滑计算 scrollZ（线性插值）
            // 使用 uniDetailData 而不是 chartData，确保与主视图一致
            const filteredData = uniDetailData.filter((item) => !item.isEmpty);
            const clampedYear = Math.max(minYear, Math.min(maxYear, year));

            // 找到年份对应的数据点范围
            let lowerIndex = 0;
            let upperIndex = filteredData.length - 1;

            for (let i = 0; i < filteredData.length - 1; i++) {
              if (
                filteredData[i].year <= clampedYear &&
                filteredData[i + 1].year >= clampedYear
              ) {
                lowerIndex = i;
                upperIndex = i + 1;
                break;
              }
            }

            // 如果年份超出范围，使用边界值
            if (clampedYear <= filteredData[0].year) {
              lowerIndex = 0;
              upperIndex = 0;
            } else if (
              clampedYear >= filteredData[filteredData.length - 1].year
            ) {
              lowerIndex = filteredData.length - 1;
              upperIndex = filteredData.length - 1;
            }

            // 线性插值计算精确的索引
            const lowerYear = filteredData[lowerIndex].year;
            const upperYear = filteredData[upperIndex].year;
            const yearRange = upperYear - lowerYear;
            const percent =
              yearRange > 0 ? (clampedYear - lowerYear) / yearRange : 0;
            const exactIndex = lowerIndex + percent * (upperIndex - lowerIndex);

            // 计算 scrollZ
            const targetZ = exactIndex * Z_STEP;
            dispatch(setScrollZ(targetZ));
            dispatch(setCurrentYear(clampedYear));
          }}
        />
        {/* 可拖动的轨道区域（整个时间轴底部） */}
        <TimelineTrack
          containerRef={containerRef}
          minYear={minYear}
          maxYear={maxYear}
          margin={margin}
          onDrag={(year) => {
            // 根据年份平滑计算 scrollZ（线性插值）
            // 使用 uniDetailData 而不是 chartData，确保与主视图一致
            const filteredData = uniDetailData.filter((item) => !item.isEmpty);
            const clampedYear = Math.max(minYear, Math.min(maxYear, year));

            // 找到年份对应的数据点范围
            let lowerIndex = 0;
            let upperIndex = filteredData.length - 1;

            for (let i = 0; i < filteredData.length - 1; i++) {
              if (
                filteredData[i].year <= clampedYear &&
                filteredData[i + 1].year >= clampedYear
              ) {
                lowerIndex = i;
                upperIndex = i + 1;
                break;
              }
            }

            // 如果年份超出范围，使用边界值
            if (clampedYear <= filteredData[0].year) {
              lowerIndex = 0;
              upperIndex = 0;
            } else if (
              clampedYear >= filteredData[filteredData.length - 1].year
            ) {
              lowerIndex = filteredData.length - 1;
              upperIndex = filteredData.length - 1;
            }

            // 线性插值计算精确的索引
            const lowerYear = filteredData[lowerIndex].year;
            const upperYear = filteredData[upperIndex].year;
            const yearRange = upperYear - lowerYear;
            const percent =
              yearRange > 0 ? (clampedYear - lowerYear) / yearRange : 0;
            const exactIndex = lowerIndex + percent * (upperIndex - lowerIndex);

            // 计算 scrollZ
            const targetZ = exactIndex * Z_STEP;
            dispatch(setScrollZ(targetZ));
            dispatch(setCurrentYear(clampedYear));
          }}
        />
      </div>
    </div>
  );
};

// 时间轴轨道组件（可拖动区域）
interface TimelineTrackProps {
  containerRef: React.RefObject<HTMLDivElement>;
  minYear: number;
  maxYear: number;
  margin: { left: number; right: number };
  onDrag: (year: number) => void;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
  containerRef,
  minYear,
  maxYear,
  margin,
  onDrag,
}) => {
  const isDraggingRef = useRef(false);
  const totalYears = maxYear - minYear;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;
      const chartStart = margin.left;
      const chartWidth = containerWidth - margin.left - margin.right;
      const chartX = x - chartStart;
      const percent = Math.max(0, Math.min(1, chartX / chartWidth));
      const year = minYear + percent * totalYears; // 使用浮点数，不要四舍五入

      onDrag(year);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // 只在轨道区域（底部）响应
      const target = e.target as HTMLElement;
      if (target.closest('.timeline-slider') || target.closest('svg')) {
        return; // 如果点击的是滑块或SVG，不处理
      }

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        // 只在底部30px区域内响应
        if (y < rect.height - 30) return;

        e.preventDefault();
        isDraggingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // 立即更新位置（使用浮点数，不要四舍五入）
        const x = e.clientX - rect.left;
        const containerWidth = rect.width;
        const chartStart = margin.left;
        const chartWidth = containerWidth - margin.left - margin.right;
        const chartX = x - chartStart;
        const percent = Math.max(0, Math.min(1, chartX / chartWidth));
        const year = minYear + percent * totalYears;
        onDrag(year);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [minYear, maxYear, totalYears, onDrag, margin, containerRef]);

  return null; // 不渲染任何元素，只是添加事件监听
};

// 时间轴滑块组件
interface TimelineSliderProps {
  containerRef: React.RefObject<HTMLDivElement>;
  minYear: number;
  maxYear: number;
  currentYear: number;
  margin: { left: number; right: number };
  onDrag: (year: number) => void;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  containerRef,
  minYear,
  maxYear,
  currentYear,
  margin,
  onDrag,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [sliderLeft, setSliderLeft] = useState(0);

  const totalYears = maxYear - minYear;

  // 根据currentYear计算滑块位置
  useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const chartWidth = containerWidth - margin.left - margin.right;
    const percent = (currentYear - minYear) / totalYears;
    const chartX = margin.left + percent * chartWidth;

    setSliderLeft(chartX);
  }, [currentYear, minYear, maxYear, totalYears, margin, containerRef]);

  useEffect(() => {
    let rafId: number | null = null;
    let pendingYear: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;

      // 计算在图表区域内的位置（减去margin）
      const chartStart = margin.left;
      const chartWidth = containerWidth - margin.left - margin.right;
      const chartX = x - chartStart;

      // 计算年份（使用浮点数，不要四舍五入）
      const percent = Math.max(0, Math.min(1, chartX / chartWidth));
      const year = minYear + percent * totalYears;

      // 使用 requestAnimationFrame 优化性能
      pendingYear = year;
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (pendingYear !== null) {
            onDrag(pendingYear);
            pendingYear = null;
          }
          rafId = null;
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // 立即更新位置（使用浮点数，不要四舍五入）
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const containerWidth = rect.width;
        const chartStart = margin.left;
        const chartWidth = containerWidth - margin.left - margin.right;
        const chartX = x - chartStart;
        const percent = Math.max(0, Math.min(1, chartX / chartWidth));
        const year = minYear + percent * totalYears;
        onDrag(year);
      }
    };

    const slider = sliderRef.current;
    if (slider) {
      // 使用捕获阶段确保事件被处理
      slider.addEventListener('mousedown', handleMouseDown, true);
      return () => {
        slider.removeEventListener('mousedown', handleMouseDown, true);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [minYear, maxYear, totalYears, onDrag, margin, containerRef]);

  return (
    <div
      ref={sliderRef}
      className="timeline-slider"
      style={{
        position: 'absolute',
        bottom: '10px',
        left: `${sliderLeft}px`,
        transform: 'translateX(-50%)',
        width: '8px',
        height: '30px',
        background: '#b2955a',
        borderRadius: '3px',
        cursor: 'grab',
        zIndex: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.3)',
        userSelect: 'none',
        pointerEvents: 'auto', // 确保可以接收鼠标事件
      }}
    />
  );
};

export default OverviewBar;
