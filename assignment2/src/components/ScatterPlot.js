"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchScatterPlotData } from "../utils/api";

export default function ScatterPlot({ dimensionality }) {
  const svgRef = useRef();
  const [topAttributes, setTopAttributes] = useState([]);
  const [squaredSums, setSquaredSums] = useState([]);
 // const [scatterData, setScatterData] = useState([]);

  useEffect(() => {
    fetchScatterPlotData(dimensionality).then((res) => {
      setTopAttributes(res.top_attributes);
      setSquaredSums(res.squared_sums); 
      //setScatterData(res.scatter_data);
      drawScatterMatrix(res.scatter_data, res.top_attributes);
    });
  }, [dimensionality]);

  const drawScatterMatrix = (data, attributes) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous plot

    const size = 100; // Size of each cell
    const padding = 20;
    const leftMargin = 70; // More space for rotated text
    const topMargin = 30;
    const width = size * 4 + padding * 5 + leftMargin;
    const height = size * 4 + padding * 5 + topMargin;

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

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cell = g.append("g")
          .attr("transform", `translate(${col * (size + padding)},${row * (size + padding)})`);

        // Draw scatter plot (except diagonal)
        if (row !== col) {
          cell.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScales[col](d[col]))
            .attr("cy", d => yScales[row](d[row]))
            .attr("r", 3)
            .attr("fill", "steelblue");
        }

        // Draw borders for each plot
        cell.append("rect")
          .attr("width", size)
          .attr("height", size)
          .attr("fill", "none")
          .attr("stroke", "#ccc");

        // Add column labels at the top
        if (row === 0) {
          g.append("text")
            .attr("x", col * (size + padding) + size / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(attributes[col]);
        }

        // **Rotated row labels (sideways)**
        if (col === 0) {
          g.append("text")
            .attr("x", -leftMargin + 10) // Adjust for visibility
            .attr("y", row * (size + padding) + size / 2)
            .attr("transform", `rotate(-90, -${leftMargin - 10}, ${row * (size + padding) + size / 2})`) // Rotate
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(attributes[row]);
        }
      }
    }
  };

  return (
    <div>
      <h3>Top 4 Attributes and Squared Sum of PCA Loadings</h3>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Squared Sum of PCA Loadings</th>
          </tr>
        </thead>
        <tbody>
          {topAttributes.map((attr, index) => (
            <tr key={index}>
              <td>{attr}</td>
              <td>{squaredSums[index].toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <svg ref={svgRef}></svg>
    </div>
  );
}
