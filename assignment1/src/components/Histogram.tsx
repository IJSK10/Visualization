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

        const values = data.map((d) => +d[column]).filter((d) => !isNaN(d));

        const width = 610;
        const height = 610;
        const margin = { top: 40, right: 100, bottom: 60, left: 100 };

        const binGenerator = d3.bin()
            .domain(d3.extent(values) as [number, number])
            .thresholds(10);

        const bins = binGenerator(values);

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        svg.selectAll('*').remove();

        const x = checked
            ? d3.scaleLinear().domain([0, d3.max(bins, (d) => d.length)!]).nice().range([margin.left, width - margin.right])
            : d3.scaleLinear().domain([d3.min(values)!, d3.max(values)!]).range([margin.left, width - margin.right]);

        const y = checked
            ? d3.scaleBand().domain(bins.map((d) => `${d.x0} - ${d.x1}`)).range([height - margin.bottom, margin.top]).padding(0.1)
            : d3.scaleLinear().domain([0, d3.max(bins, (d) => d.length)!]).nice().range([height - margin.bottom, margin.top]);

        const xAxis = d3.axisBottom(x).ticks(10);
        const yAxis = checked ? d3.axisLeft(y) : d3.axisLeft(y).ticks(10);


        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis);

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

        if (checked) {
            svg.append('g')
                .attr('class', 'grid')
                .attr('transform', `translate(0, ${height - margin.bottom})`)
                .call(
                    d3.axisBottom(x)
                        .tickSize(-(height - margin.top - margin.bottom))
                        .tickFormat(() => '')
                )
                .selectAll('line')
                .attr('stroke', 'gray')
                .attr('stroke-opacity', 0.3);
        } else {
            svg.append('g')
                .attr('class', 'grid')
                .attr('transform', `translate(${margin.left},0)`)
                .call(
                    d3.axisLeft(y)
                        .tickSize(-(width - margin.left - margin.right))
                        .tickFormat(() => '')
                )
                .selectAll('line')
                .attr('stroke', 'gray')
                .attr('stroke-opacity', 0.3);
        }

        svg.append('g')
            .attr('transform', `translate(${checked ? margin.left : margin.left},0)`)
            .call(yAxis)
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', '#333')
            .style('text-anchor', 'end');

        const tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('background', 'white')
            .style('padding', '5px')
            .style('border', '1px solid #ccc')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('display', 'none');

        const bars = svg.selectAll('rect')
            .data(bins)
            .enter()
            .append('rect')
            .attr('x', checked ? margin.left : (d) => x(d.x0!))
            .attr('y', checked ? (d) => y(`${d.x0} - ${d.x1}`)! : (d) => y(d.length))
            .attr('width', checked ? (d) => x(d.length) - margin.left : (d) => Math.max(1, x(d.x1!) - x(d.x0!) - 1))
            .attr('height', checked ? y.bandwidth() : (d) => height - margin.bottom - y(d.length))
            .attr('fill', '#69b3a2')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', '#2c7a7b'); // Darken color on hover
                tooltip
                    .style('display', 'block')
                    .html(`<strong>Range:</strong> ${d.x0} - ${d.x1} <br> <strong>Frequency:</strong> ${d.length}`)
                    .style('left', event.pageX + 'px')
                    .style('top', event.pageY - 28 + 'px');
            })
            .on('mousemove', function (event) {
                tooltip
                    .style('left', event.pageX + 'px')
                    .style('top', event.pageY - 28 + 'px');
            })
            .on('mouseout', function () {
                d3.select(this).attr('fill', '#69b3a2'); 
                tooltip.style('display', 'none');
            });

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#333')
            .text(checked ? `Horizontal Histogram of ${column}` : `Histogram of ${column}`);

        return () => tooltip.remove(); 
    }, [data, column, checked]);

    return <svg ref={svgRef}></svg>;
};
