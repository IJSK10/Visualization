"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchScatterPlotData } from "../utils/api";

export default function ScatterPlot({ dimensionality,component1,component2,k }) {
  const svgRef = useRef();
  const [topAttributes, setTopAttributes] = useState([]);
  const [squaredSums, setSquaredSums] = useState([]);

  useEffect(() => {
    fetchScatterPlotData(dimensionality,component1,component2,k).then((res) => {
      setTopAttributes(res.top_attributes);
      setSquaredSums(res.squared_sums); 
      drawScatterMatrix(res.scatter_data, res.top_attributes,res.cluster);
    });
  }, [dimensionality,k,component1,component2]);

  const drawScatterMatrix = (data, attributes,clusters) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = 140; 
    const padding = 20;
    const leftMargin = 70; 
    const topMargin = 30;
    const width = size * 4 + padding * 5 + leftMargin + 150;
    const height = size * 4 + padding * 5 + topMargin + 60;

    const xScales = attributes.map((_, i) =>
      d3.scaleLinear()
        .domain(d3.extent(data, d => d[i]))
        .range([0, size])
    );

    const yScales = attributes.map((_, i) =>
      d3.scaleLinear()
        .domain(d3.extent(data, d => d[i]))
        .range([size, 0])
    );

    const g = svg.attr("width", width).attr("height", height)
      .append("g")
      .attr("transform", `translate(${leftMargin},${topMargin})`);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cell = g.append("g")
          .attr("transform", `translate(${col * (size + padding)},${row * (size + padding)})`);

        if (row !== col) {
          cell.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScales[col](d[col]))
            .attr("cy", d => yScales[row](d[row]))
            .attr("r", 3)
            .attr("fill", (d,i) => colorScale(clusters[i]))
        }
          else {
            cell.append("text")
              .attr("x", size / 2)
              .attr("y", size / 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .style("font-size", "12px")
              .style("fill", "#333")
              .text(attributes[row]);
          }

        cell.append("rect")
          .attr("width", size)
          .attr("height", size)
          .attr("fill", "none")
          .attr("stroke", "#ccc");

        if (row === 0) {
          g.append("text")
            .attr("x", col * (size + padding) + size / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(attributes[col]);
        }

        if (col === 0) {
          g.append("text")
            .attr("x", -leftMargin + 10) 
            .attr("y", row * (size + padding) + size / 2)
            .attr("transform", `rotate(-90, -${leftMargin - 10}, ${row * (size + padding) + size / 2})`) 
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(attributes[row]);
        }

        if (row === 3) {
          const xAxis = d3.axisBottom(xScales[col]);
          
          const xAxisGroup = g.append("g")
            .attr("transform", `translate(${col * (size + padding)}, ${size * 4 + padding * 4})`)
            .call(xAxis)
            .style("font-size", "10px");
          
          xAxisGroup.selectAll("text")
            .attr("transform", "rotate(90)")
            .attr("text-anchor", "start")
            .attr("dx", "1.2em")
            .attr("dy", "-0.7em");
        }
  
        if (col === 3) {
          g.append("g")
            .attr("transform", `translate(${size * 4 + padding * 4}, ${row * (size + padding)})`)
            .call(d3.axisRight(yScales[row])) 
            .style("font-size", "10px");
        }
      }
    }

    const uniqueClusters = [...new Set(clusters)];
    const legend = svg.append("g").attr("transform", `translate(${width - 120}, 40)`);

    uniqueClusters.forEach((cluster, i) => {
      legend
        .append("circle")
        .attr("cx", 0)
        .attr("cy", i * 20)
        .attr("r", 5)
        .attr("fill", colorScale(cluster));

      legend
        .append("text")
        .attr("x", 10)
        .attr("y", i * 20 + 4)
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(`Cluster ${cluster}`);
    });
  };

  return (
    <div>
     <h3 className="text font-bold text-center mb-4 text-gray-800">
  Top 4 Attributes and Squared Sum of PCA Loadings
</h3>

<div className="overflow-x-auto pb-10">
  <table className="min-w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
    <thead>
      <tr className="bg-blue-500 text-white">
        <th className="px-2 py-1 text-left text-sm font-semibold">Attribute</th>
        <th className="px-2 py-1 text-left text-sm font-semibold">
          Squared Sum of PCA Loadings
        </th>
      </tr>
    </thead>
    <tbody>
      {topAttributes.map((attr, index) => (
        <tr
          key={index}
          className={`border-b ${
            index % 2 === 0 ? "bg-gray-100" : "bg-white"
          } hover:bg-blue-100 transition`}
        >
          <td className="px-3 py-1">{attr}</td>
          <td className="px-3 py-1">{squaredSums[index].toFixed(4)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      <svg ref={svgRef}></svg>
    </div>
  );
}
