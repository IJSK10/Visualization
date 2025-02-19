import React, { useEffect, useRef } from 'react';
import { columnxAxis } from '@/constants/column';
import * as d3 from 'd3';

interface BarPlotProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  column: string;
  checked: boolean;
  sortData: boolean;
}

export const BarPlot: React.FC<BarPlotProps> = ({ data, column, checked, sortData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0 || !column) return;

    const width = 610;
    const height = 610;
    let margin = { top: 50, right: 50, bottom: 70, left: 90 };
    if (checked) {
      margin = { top: 50, right: 50, bottom: 70, left: 180 };
    } else {
      margin = { top: 50, right: 50, bottom: 90, left: 50 };
    }

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

    let Data= Array.from(counts.entries());

    if (column==="Developer" || column==="Publisher")
    {
      Data = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    }
    else
    {
      Data = sortData
      ? Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
      : Array.from(counts.entries());
    }

    
    const sortedData = Data.slice(0, 20);

    let x, y, xAxis, yAxis;

    if (checked) {
      
      x = d3.scaleLinear()
        .domain([0, d3.max(sortedData, (d) => d[1])!])
        .nice()
        .range([margin.left, width - margin.right]);

      y = d3.scaleBand()
        .domain(sortedData.map(d => d[0]))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

      xAxis = d3.axisBottom(x).ticks(6);
      yAxis = d3.axisLeft(y).tickSize(0);

      svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(-height + margin.top + margin.bottom).tickFormat(() => ""))
        .selectAll("line")
        .style("stroke", "#ccc");
    } else {
      
      x = d3.scaleBand()
        .domain(sortedData.map(d => d[0]))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      y = d3.scaleLinear()
        .domain([0, d3.max(sortedData, (d) => d[1])!])
        .nice()
        .range([height - margin.bottom, margin.top]);

      xAxis = d3.axisBottom(x).tickSize(0);
      yAxis = d3.axisLeft(y).ticks(6);

      svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSize(-width + margin.left + margin.right).tickFormat(() => ""))
        .selectAll("line")
        .style("stroke", "#ccc");
    }

    
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid black')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('display', 'none');

    
    svg.selectAll('.bar')
      .data(sortedData)
      .join('rect')
      .attr('class', 'bar')
      .attr('fill', 'steelblue')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', 'red'); 
        tooltip
          .style('display', 'block')
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 20 + 'px')
          .html(`Occurrences: ${d[1]}`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', 'steelblue'); 
        tooltip.style('display', 'none');
      })
      .transition()
      .duration(800)
      .attr('x', checked ? margin.left : (d) => x(d[0])!)
      .attr('y', checked ? (d) => y(d[0])! : (d) => y(d[1]))
      .attr('width', checked ? (d) => x(d[1]) - margin.left : x.bandwidth())
      .attr('height', checked ? y.bandwidth() : (d) => height - margin.bottom - y(d[1]));

    
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', checked ? 'rotate(0)' : 'rotate(-20)')
      .style('text-anchor', checked ? 'middle' : 'end');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);

    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text(checked ? 'Frequency' : columnxAxis[column]);

    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text(checked ? columnxAxis[column] : 'Frequency');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', '#333')
      .text(checked ? `Horizontal Bar Plot of ${column}` : `Bar Plot of ${column}`);

  }, [data, column, checked, sortData]); 

  return <svg ref={svgRef}></svg>;
};
