import * as d3 from 'd3';
import { TJUHistoryEvent } from '../types';

export class TimelineRendererManager {
    private container: HTMLElement;
    private world!: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private events: TJUHistoryEvent[] = [];
    private animationId: number | null = null;

    private readonly CONFIG = {
        STEP: 500,           
        START_YEAR: 1895,
        END_YEAR: 2025,
        ROAD_COUNT: 100,      // 段数
        // 使用 STEP 作为 z 轴步长，保证路段高度与 Z 步长一致，避免缝隙
        LERP_FACTOR: 0.1,    
        FADE_DIST: -8000     
    };

    private state = {
        cameraZ: 0,
        targetZ: 0,
        maxZ: 0
    };

    private chartColor = d3.scaleOrdinal<string>()
        .range(["#00448a", "#b2955a", "#6688aa", "#d6cfba"]);

    constructor(container: HTMLElement, rawData: TJUHistoryEvent[]) {
        this.container = container;
        this.state.maxZ = (this.CONFIG.END_YEAR - this.CONFIG.START_YEAR) * this.CONFIG.STEP;
        this.initDOM();
        this.processData(rawData);
        this.renderStaticScene();
        this.renderSprites();
        this.initInfoPanel();
        this.animate();
    }

    private initDOM() {
        const root = d3.select(this.container);
        root.html(''); 
        root.append('div').attr('class', 'horizon-glow');
        const viewport = root.append('div').attr('id', 'viewport');
        this.world = viewport.append('div').attr('id', 'world');
    }

    private processData(rawData: TJUHistoryEvent[]) {
        const dataMap = new Map(rawData.map(e => [e.year, e]));
        const timeline: TJUHistoryEvent[] = [];
        for (let y = this.CONFIG.START_YEAR; y <= this.CONFIG.END_YEAR; y++) {
            const z = -(y - this.CONFIG.START_YEAR) * this.CONFIG.STEP;
            const eventData = dataMap.get(y);

            if (y % 5 === 0 || eventData) {
                timeline.push({
                    year: y,
                    type: 'mark',
                    z: z,
                    x: 0,
                    yOffset: -220 // 抬高文字，防止与路面重叠
                });
            }

            if (eventData) {
                timeline.push({
                    ...eventData,
                    type: 'event',
                    z: z,
                    x: (y % 10 === 5 ? -350 : 350), 
                    yOffset: -220 
                });
            }
        }
        this.events = timeline;
    }

    private renderStaticScene() {
        this.world.selectAll('.road-group').remove();
        const roadGroup = this.world.append('div').attr('class', 'road-group');

        // 渲染连续路面（使用 STEP 作为 z 步长，与示例一致）
        roadGroup.selectAll('.road-segment')
            .data(d3.range(this.CONFIG.ROAD_COUNT))
            .enter()
            .append('div')
            .attr('class', 'road-segment')
            .style('transform', i => {
                const z = -i * this.CONFIG.STEP;
                // 与示例保持一致的俯视角度，让段落按 Z 轴叠加
                return `translate3d(0, 0, ${z}px) rotateX(85deg)`;
            })
            .style('z-index', i => 1000 - i);

        // 渲染立柱
        [-380, 380].forEach(xOffset => {
            roadGroup.selectAll(`.post-${xOffset}`)
                .data(d3.range(0, this.CONFIG.ROAD_COUNT, 2))
                .enter()
                .append('div')
                .attr('class', 'time-post')
                .style('left', `calc(50% + ${xOffset}px)`)
                .style('transform', i => `translate3d(0, 0, ${-i * this.CONFIG.STEP}px)`);
        });
    }

    private renderSprites() {
        this.world.selectAll('.sprite')
            .data(this.events).enter()
            .append('div')
            .attr('class', d => `sprite ${d.type === 'mark' ? 'year-mark' : 'event-card'}`)
            .html(d => d.type === 'mark' 
                ? `<div class="year-num">${d.year}</div><div class="year-desc">TJU HISTORY</div>`
                : `<h3>${d.title}</h3><p>${d.desc}</p>`
            );

        this.world.selectAll('.sprite').on('click', (e, d: any) => {
            e.stopPropagation();
            if (d.z !== undefined) this.state.targetZ = -d.z;
            if (d.type === 'event') this.updatePanel(d);
        });
    }

    private initInfoPanel() {
        d3.select(this.container).append('div').attr('id', 'info-panel')
            .html(`
                <div id="chart-container"></div>
                <div class="panel-content">
                    <h4 id="panel-year">请选择年份</h4>
                    <div class="stat" id="panel-majors"></div>
                    <div class="stat" id="panel-total"></div>
                    <div class="career-tag" id="panel-career"></div>
                </div>
            `);
            
        d3.select(this.container).on("click", (e: any) => {
             if (!e.target.closest('.sprite')) d3.select('#info-panel').classed('active', false);
        });
    }

    private updatePanel(d: TJUHistoryEvent) {
        const panel = d3.select('#info-panel').classed('active', true);
        panel.select("#panel-year").text(`${d.year}年 · ${d.title}`);
        panel.select("#panel-majors").text(`专业数: ${d.major_count}`);
        panel.select("#panel-total").text(`在校生: ${d.student_total}人`);
        panel.select("#panel-career").text(`去向: ${d.career}`);

        const container = d3.select("#chart-container");
        container.selectAll("*").remove();
        if (!d.majors) return;

        const svg = container.append("svg").attr("width", 100).attr("height", 100).append("g").attr("transform", "translate(50,50)");
        const pie = d3.pie<any>().value(m => m.v);
        const arc = d3.arc<any>().innerRadius(25).outerRadius(50);
        svg.selectAll("path").data(pie(d.majors)).enter().append("path").attr("d", arc).attr("fill", (m: any) => this.chartColor(m.data.n)).attr("stroke", "#fff");
    }

    public handleScroll(delta: number) {
        this.state.targetZ += delta;
        this.state.targetZ = Math.max(0, Math.min(this.state.targetZ, this.state.maxZ + 500));
    }

    private animate = () => {
        this.state.cameraZ += (this.state.targetZ - this.state.cameraZ) * this.CONFIG.LERP_FACTOR;
        
        // 使用与示例一致的 translate3d，Y 偏移由 CSS 中的 top 控制
        this.world.style("transform", `translate3d(0, 0, ${this.state.cameraZ}px)`);

        this.world.selectAll('.sprite').each((d: any, i, nodes) => {
            const relativeZ = d.z + this.state.cameraZ;
            const el = d3.select(nodes[i]);

            if (relativeZ > 1000 || relativeZ < this.CONFIG.FADE_DIST) {
                el.style("opacity", 0).style("pointer-events", "none");
            } else {
                const opacity = Math.min(1, 1 - Math.abs(relativeZ) / 8000);
                el.style("opacity", opacity)
                  .style("pointer-events", "auto")
                  .style("transform", `translate3d(${d.x}px, ${d.yOffset}px, ${d.z}px)`);
            }
        });

        this.world.selectAll('.road-segment').each((d: any, i, nodes) => {
            const relativeZ = (-i * this.CONFIG.ROAD_HEIGHT) + this.state.cameraZ;
            const opacity = Math.min(1, Math.max(0, 1 - Math.abs(relativeZ) / 8000));
            d3.select(nodes[i]).style("opacity", opacity);
        });

        this.animationId = requestAnimationFrame(this.animate);
    }

    public destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}