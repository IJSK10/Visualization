"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchPCAData } from "../utils/api";

export default function ScreePlot({ dimensionality, setDimensionality }) {
  const svgRef = useRef();
  const [eigenvalues, setEigenvalues] = useState([]);

  useEffect(() => {
    fetchPCAData().then((res) => {
      setEigenvalues(res.eigenvalues);
      drawScreePlot(res.eigenvalues);
    });
  }, [dimensionality]);

  const drawScreePlot = (eigenvalues) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous plot

    const width = 400,
      height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .domain(eigenvalues.map((_, i) => i + 1))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(eigenvalues)])
      .nice()
      .range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Bars
    g.selectAll("rect")
      .data(eigenvalues)
      .enter()
      .append("rect")
      .attr("x", (_, i) => xScale(i + 1))
      .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d))
      .attr("fill", (_, i) => (i + 1 === dimensionality ? "orange" : "steelblue"))
      .style("cursor", "pointer")
      .on("click", (j, i) => {
        for (let k=0;k<eigenvalues.length;k++)
        {
          if (eigenvalues[k]===i)
          {
            console.log(eigenvalues[k]);
            console.log(i);
            setDimensionality(k+1);
            break;
          }
        }
        console.log(dimensionality);
  });

    // Line
    const line = d3
      .line()
      .x((_, i) => xScale(i + 1) + xScale.bandwidth() / 2)
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(eigenvalues)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Circles
    g.selectAll(".dot")
      .data(eigenvalues)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(i + 1) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d))
      .attr("r", 4)
      .attr("fill", "red");

    // Axes
    g.append("g").call(d3.axisLeft(yScale));
    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale));
  };

  return (
    <div className="flex flex-col items-center">
      {/* Slider Input */}
      <div className="flex items-center gap-2 mt-4">
        <span className="font-bold">Dimensionality:</span>
        <input
          type="range"
          min="1"
          max={eigenvalues.length || 10}
          value={dimensionality}
          onChange={(e) => setDimensionality(parseInt(e.target.value))}
          className="w-40"
        />
        <span className="font-bold">{dimensionality}</span>
      </div>
      <svg ref={svgRef} width={400} height={300}></svg>
    </div>
  );
}
