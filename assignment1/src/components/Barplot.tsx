import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BarPlotProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  column: string;
}

export const BarPlot: React.FC<BarPlotProps> = ({ data, column }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0 || !column) return;

    const width = 800;
    const height = 550;
    const margin = { top: 40, right: 30, bottom: 70, left: 60 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f9f9f9'); 

    svg.selectAll('*').remove(); 

    const counts = d3.rollup(
      data,
      (v) => v.length,
      (d) => d[column]
    );

    const sortedData = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]); // Sort by frequency

    const x = d3.scaleBand()
      .domain(sortedData.map(d => d[0]))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d[1])!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x).tickSize(0);
    const yAxis = d3.axisLeft(y).ticks(6);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-20)') 
      .style('text-anchor', 'end');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);

    svg.selectAll('.bar')
      .data(sortedData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d[0])!)
      .attr('y', height - margin.bottom)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', 'steelblue')
      .transition()
      .duration(800)
      .attr('y', (d) => y(d[1]))
      .attr('height', (d) => height - margin.bottom - y(d[1]));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', '#333')
      .text(`Bar Plot of ${column}`);

  }, [data, column]);

  return <svg ref={svgRef}></svg>;
};
