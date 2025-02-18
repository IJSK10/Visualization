import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { columnTypeMap } from '../constants/column'; // Assuming you have a map for column types

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

        const size = 900; // Square canvas
        const margin = { top: 50, right: 50, bottom: 100, left: 100 };

        // Remove any previous rendering
        const svg = d3.select(svgRef.current)
            .attr('width', size)
            .attr('height', size);
        svg.selectAll('*').remove();

        // Determine column types (categorical or numerical)
        const isXCategorical = columnTypeMap[xColumn] === true;
        const isYCategorical = columnTypeMap[yColumn] === true;

        // Define scales
        let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
        let yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;

        if (isXCategorical) {
            const uniqueX = [...new Set(xValues)] as string[];
            xScale = d3.scaleBand<string>()
                .domain(uniqueX)
                .range([margin.left, size - margin.right])
                .padding(0.4); // Increase padding for more spacing
        } else {
            const numericXValues = xValues.map((d) => Number(d)).filter((d) => !isNaN(d));
            xScale = d3.scaleLinear()
                .domain([d3.min(numericXValues) as number, d3.max(numericXValues) as number])
                .nice()
                .range([margin.left, size - margin.right]);
        }

        if (isYCategorical) {
            const uniqueY = [...new Set(yValues)] as string[];
            yScale = d3.scaleBand<string>()
                .domain(uniqueY)
                .range([size - margin.bottom, margin.top])
                .padding(0.4); // Increase padding for more spacing
        } else {
            const numericYValues = yValues.map((d) => Number(d)).filter((d) => !isNaN(d));
            yScale = d3.scaleLinear()
                .domain([d3.min(numericYValues) as number, d3.max(numericYValues) as number])
                .nice()
                .range([size - margin.bottom, margin.top]);
        }

        // Draw axes
        const xAxis = isXCategorical
            ? d3.axisBottom(xScale as d3.ScaleBand<string>)
            : d3.axisBottom(xScale as d3.ScaleLinear<number, number>).ticks(6);

        const yAxis = isYCategorical
            ? d3.axisLeft(yScale as d3.ScaleBand<string>)
            : d3.axisLeft(yScale as d3.ScaleLinear<number, number>).ticks(6);

        svg.append('g')
            .attr('transform', `translate(0,${size - margin.bottom})`)
            .call(xAxis)
            .selectAll("text") // Rotate x-axis labels for better readability
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yAxis);

        // Draw scatter points
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
            .attr('r', 8) // Increase point size for better visibility
            .attr('fill', '#69b3a2');

    }, [data, xColumn, yColumn]);

    return <svg ref={svgRef}></svg>;
};
