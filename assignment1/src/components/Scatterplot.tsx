import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { columnTypeMap,columnxAxis } from '../constants/column'; 

interface ScatterPlotProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>[];
    xColumn: string;
    yColumn: string;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, xColumn, yColumn }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (data.length === 0 || !xColumn || !yColumn) return;

        const xValues = data.map((d) => d[xColumn]);
        const yValues = data.map((d) => d[yColumn]);

        const size = 650; 
        const margin = { top: 50, right: 50, bottom: 100, left: 120 };

        const svg = d3.select(svgRef.current)
            .attr('width', size)
            .attr('height', size);
        svg.selectAll('*').remove();

        const tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('background', 'white')
            .style('border', '1px solid black')
            .style('padding', '5px')
            .style('border-radius', '5px')
            .style('display', 'none');

        const isXCategorical = columnTypeMap[xColumn] === true;
        const isYCategorical = columnTypeMap[yColumn] === true;

        let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
        let yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;

        if (isXCategorical) {
            const countMap = new Map<string, number>();
            data.forEach((d) => {
                countMap.set(d[xColumn], (countMap.get(d[xColumn]) || 0) + 1);
            });
        
            // Sort by frequency and take top 20
            const topXCategories = Array.from(countMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map((d) => d[0]);
        
            xScale = d3.scaleBand<string>()
                .domain(topXCategories)
                .range([margin.left, size - margin.right])
                .padding(0.4);
        
            data = data.filter((d) => topXCategories.includes(d[xColumn]));
        } else {
            const numericXValues = xValues.map((d) => Number(d)).filter((d) => !isNaN(d));
            xScale = d3.scaleLinear()
                .domain([d3.min(numericXValues) as number, d3.max(numericXValues) as number])
                .nice()
                .range([margin.left, size - margin.right]);
        }

        if (isYCategorical) {
            const countMap = new Map<string, number>();
            data.forEach((d) => {
                countMap.set(d[yColumn], (countMap.get(d[yColumn]) || 0) + 1);
            });
        
            // Sort by frequency and take top 20
            const topYCategories = Array.from(countMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map((d) => d[0]);
        
            yScale = d3.scaleBand<string>()
                .domain(topYCategories)
                .range([size - margin.bottom, margin.top])
                .padding(0.4);
        
            data = data.filter((d) => topYCategories.includes(d[yColumn]));
        } else {
            const numericYValues = yValues.map((d) => Number(d)).filter((d) => !isNaN(d));
            yScale = d3.scaleLinear()
                .domain([d3.min(numericYValues) as number, d3.max(numericYValues) as number])
                .nice()
                .range([size - margin.bottom, margin.top]);
        }

        const xAxis = isXCategorical
            ? d3.axisBottom(xScale as d3.ScaleBand<string>)
            : d3.axisBottom(xScale as d3.ScaleLinear<number, number>).ticks(6);

        const yAxis = isYCategorical
            ? d3.axisLeft(yScale as d3.ScaleBand<string>)
            : d3.axisLeft(yScale as d3.ScaleLinear<number, number>).ticks(6);

        svg.append('g')
            .attr('transform', `translate(0,${size - margin.bottom})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yAxis);

        svg.append("text")
            .attr("x", size / 2)
            .attr("y", size - margin.bottom + 50)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(columnxAxis[xColumn]);

        svg.append("text")
            .attr("x", -(size / 2))
            .attr("y", margin.left - 80)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(columnxAxis[yColumn]);

        svg.append("text")
            .attr("x", size / 2)
            .attr("y", margin.top - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text(`${xColumn} vs ${yColumn}`);

        if (isXCategorical && isYCategorical) {
            const countMap = new Map<string, number>();
            data.forEach((d) => {
                const key = `${d[xColumn]}|${d[yColumn]}`;
                countMap.set(key, (countMap.get(key) || 0) + 1);
            });


            const maxCount = Math.max(...countMap.values());
            const radiusScale = d3.scaleSqrt().domain([1, maxCount]).range([5, 20]);

            svg.selectAll('circle')
                .data(Array.from(countMap.entries()))
                .enter()
                .append('circle')
                .attr('cx', (d) => (xScale(d[0].split('|')[0]) ?? 0) + (xScale as d3.ScaleBand<string>).bandwidth() / 2)
                .attr('cy', (d) => (yScale(d[0].split('|')[1]) ?? 0) + (yScale as d3.ScaleBand<string>).bandwidth() / 2)
                .attr('r', (d) => radiusScale(d[1])) // Scale radius by count
                .attr('fill', '#69b3a2')
                .attr('opacity', 0.7)
                .on('mouseover', function (event, d) {
                    d3.select(this).attr('fill', 'red'); 
                    tooltip
                        .style('display', 'block')
                        .style('left', event.pageX + 10 + 'px')
                        .style('top', event.pageY - 20 + 'px')
                        .html(`Occurrences: ${d[1]}`);
                })
                .on('mouseout', function () {
                    d3.select(this).attr('fill', '#69b3a2'); 
                    tooltip.style('display', 'none');
                });
        } else {
            svg.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', (d) => {
                    const xValue = d[xColumn];
                    return isXCategorical
                        ? (xScale(xValue as string) ?? 0) + (xScale as d3.ScaleBand<string>).bandwidth() / 2
                        : (xScale as d3.ScaleLinear<number, number>)(Number(xValue));
                })
                .attr('cy', (d) => {
                    const yValue = d[yColumn];
                    return isYCategorical
                        ? (yScale(yValue as string) ?? 0) + (yScale as d3.ScaleBand<string>).bandwidth() / 2
                        : (yScale as d3.ScaleLinear<number, number>)(Number(yValue));
                })
                .attr('r', 8)
                .attr('fill', '#69b3a2');
        }

    }, [data, xColumn, yColumn]);

    return <svg ref={svgRef}></svg>;
};
