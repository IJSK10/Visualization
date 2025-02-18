import React, { useEffect, useRef } from 'react';
import { columnxAxis } from '@/constants/column';
import * as d3 from 'd3';

interface BarPlotProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  column: string;
  checked: boolean;

}

export const BarPlot: React.FC<BarPlotProps> = ({ data, column, checked }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0 || !column) return;

    // Add bars with animation
    if (checked) {

      const width = 1200;
      const height = 1200;
      const margin = { top: 20, right: 20, bottom: 50, left: 170 };

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f9f9f9'); // Light gray background

      svg.selectAll('*').remove(); // Clear previous drawings

      const counts = d3.rollup(
        data,
        (v) => v.length,
        (d) => d[column]
      );

      const sortedData = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

      const x = d3.scaleLinear()
        .domain([0, d3.max(sortedData, (d) => d[1])!])
        .nice()
        .range([margin.left, width - margin.right]);

      const y = d3.scaleBand()
        .domain(sortedData.map(d => d[0]))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

      // Add axes
      const xAxis = d3.axisBottom(x).ticks(6);
      const yAxis = d3.axisLeft(y).tickSize(0);

      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#333')
        .text('Frequency');

      svg.append('text')
        .attr('x', -height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '14px')
        .style('fill', '#333')
        .text(columnxAxis[column]);

      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(xAxis);

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis);

      // Add bars with animation
      svg.selectAll('.bar')
        .data(sortedData)
        .join('rect')
        .attr('class', 'bar')
        .attr('y', (d) => y(d[0])!)
        .attr('x', margin.left)
        .attr('height', y.bandwidth())
        .attr('width', 0)
        .attr('fill', 'steelblue') // Color improvement
        .transition()
        .duration(800)
        .attr('width', (d) => x(d[1]) - margin.left);

      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#333')
        .text(`Horizontal Bar Plot of ${column}`);
    }
    else {

      const width = 1200;
      const height = 1200;
      const margin = { top: 20, right: 20, bottom: 110, left: 50 };

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f9f9f9'); // Light gray background

      svg.selectAll('*').remove(); // Clear previous drawings

      const counts = d3.rollup(
        data,
        (v) => v.length,
        (d) => d[column]
      );

      const sortedData = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

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

      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#333')
        .text(columnxAxis[column]);

      svg.append('text')
        .attr('x', -height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '14px')
        .style('fill', '#333')
        .text('Frequency');


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
    }
  }, [data, column, checked]);

  return <svg ref={svgRef}></svg>;
};
