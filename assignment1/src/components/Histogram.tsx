import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { columnxAxis } from '../constants/column';

interface HistogramProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    column: string;
    checked: boolean;
}

export const Histogram: React.FC<HistogramProps> = ({ data, column, checked }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (data.length === 0 || !column) return;


        if (checked) {

            const values = data.map((d) => +d[column]).filter((d) => !isNaN(d));

            const width = 1200;
            const height = 1200;

            const margin = { top: 40, right: 100, bottom: 60, left: 100 };

            // Create bin generator (Histogram bins)
            const binGenerator = d3.bin()
                .domain(d3.extent(values) as [number, number]) // Auto min & max
                .thresholds(10); // Number of bins

            const bins = binGenerator(values);

            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height);

            svg.selectAll('*').remove(); // Clear previous render

            // Y Scale: Represents the numerical range (bins)
            const y = d3.scaleBand()
                .domain(bins.map((d) => `${d.x0} - ${d.x1}`)) // Bin labels
                .range([height - margin.bottom, margin.top]) 
                .padding(0.1);

            // X Scale: Represents frequency (count of values in each bin)
            const x = d3.scaleLinear()
                .domain([0, d3.max(bins, (d) => d.length)!])
                .nice()
                .range([margin.left, width - margin.right]);

            // Axes
            const xAxis = d3.axisBottom(x).ticks(10);
            const yAxis = d3.axisLeft(y);

            // Append x-axis
            svg.append('g')
                .attr('transform', `translate(0,${height - margin.bottom})`)
                .call(xAxis);

            // Append y-axis
            svg.append('g')
                .attr('transform', `translate(${margin.left},0)`)
                .call(yAxis);

            // X-axis Label (Frequency)
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height - 10)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('fill', '#333')
                .text('Frequency');

            // Y-axis Label (Numerical Range)
            svg.append('text')
                .attr('x', -height / 2)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(-90)')
                .style('font-size', '14px')
                .style('fill', '#333')
                .text(columnxAxis[column]);

            svg.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(0, ${height - margin.bottom})`)
                .call(
                    d3.axisBottom(x)
                        .tickSize(-(height - margin.top - margin.bottom)) // Extend to the top
                        .tickFormat(null) // Hide tick labels
                )
                .selectAll("line")
                .attr("stroke", "gray")
                .attr("stroke-opacity", 0.3);



            // Draw bars (Horizontal histogram)
            svg.selectAll('rect')
                .data(bins)
                .enter()
                .append('rect')
                .attr('x', margin.left) // Start from left
                .attr('y', (d) => y(`${d.x0} - ${d.x1}`)!) // Position bars by bin
                .attr('width', (d) => x(d.length) - margin.left) // Width = frequency count
                .attr('height', y.bandwidth()) // Bar height
                .attr('fill', '#69b3a2');

            // Title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('fill', '#333')
                .text(`Horizontal Histogram of ${column}`);

        }

        else {

            const values = data.map((d) => +d[column]).filter((d) => !isNaN(d));

            const width = 1200;
            const height = 1200;


            const margin = { top: 40, right: 40, bottom: 50, left: 60 };

            const binGenerator = d3.bin().domain([d3.min(values)!, d3.max(values)!]).thresholds(10);

            const bins = binGenerator(values);

            const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

            svg.selectAll('*').remove();

            const x = d3.scaleLinear().domain([d3.min(values)!, d3.max(values)!]).range([margin.left, width - margin.right]);
            const y = d3.scaleLinear().domain([0, d3.max(bins, (d) => d.length)!]).nice().range([height - margin.bottom, margin.top]);

            const xAxis = d3.axisBottom(x);
            const yAxis = d3.axisLeft(y);

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

            svg.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(${margin.left}, 0)`)
                .call(
                    d3.axisLeft(y)
                        .tickSize(-(width - margin.left - margin.right)) // Extend to the right
                        .tickFormat(null) // Hide tick labels
                )
                .selectAll("line")
                .attr("stroke", "gray")
                .attr("stroke-opacity", 0.3);

            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('fill', '#333')
                .text(`Horizontal Histogram of ${column}`);

        }

    }, [data, column, checked]);

    return <svg ref={svgRef}></svg>;
};