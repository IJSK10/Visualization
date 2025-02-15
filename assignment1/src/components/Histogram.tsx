import React, {useEffect,useRef} from 'react';
import * as d3 from 'd3';

interface HistogramProps{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data : any[];
    column: string;
}

export const Histogram: React.FC<HistogramProps> = ({data,column}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(()=>{
        if (data.length===0 || !column) return;
        const values=data.map((d)=>+d[column]).filter((d)=>!isNaN(d));
        
        const width=500;
        const height=300;
        //svg.attr('width',width).attr('height',height);;

        
        const margin={top:20,right:30,bottom:40,left:40};

        const binGenerator=d3.bin().domain([d3.min(values)!,d3.max(values)!]).thresholds(10);

        const bins=binGenerator(values);

        const svg=d3.select(svgRef.current).attr('width',width).attr('height',height);

        svg.selectAll('*').remove();

        const x =d3.scaleLinear().domain([d3.min(values)!,d3.max(values)!]).range([margin.left,width-margin.right]);
        const y =d3.scaleLinear().domain([0,d3.max(bins,(d)=>d.length)!]).nice().range([height-margin.bottom,margin.top]);

        const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);

    // Draw bars
    svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.x0!))
      .attr('y', (d) => y(d.length))
      .attr('width', (d) => Math.max(1, x(d.x1!) - x(d.x0!) - 1))
      .attr('height', (d) => height - margin.bottom - y(d.length))
      .attr('fill', '#69b3a2');

  }, [data, column]);

    return <svg ref={svgRef}></svg>;
};