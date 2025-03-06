"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { fetchMSEPlotData } from "../utils/api";

export default function MSEPlot({ kValue, onKChange }) {
  const mseSvgRef = useRef();

  useEffect(() => {
    fetchMSEPlotData().then((res) => {
      drawMSEPlot(res.mse_scores, kValue);
    });
  }, [kValue]);

  const drawMSEPlot = (mseScores, selectedK) => {
    const svg = d3.select(mseSvgRef.current);
    svg.selectAll("*").remove();

    const width = 500,
      height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(d3.range(1, 11)).range([0, innerWidth]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, d3.max(mseScores)]).nice().range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(mseScores)
      .enter()
      .append("rect")
      .attr("x", (_, i) => xScale(i + 1))
      .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d))
      .attr("fill", (_, i) => (i + 1 === selectedK ? "orange" : "steelblue"))
      .style("cursor", "pointer")
      .on("click", (_, i) => {
        for (let k=0;k<mseScores.length;k++)
        {
          if (mseScores[k]===i)
          {
            onKChange(k+1);
            break;
          }
        }});

    g.append("g").call(d3.axisLeft(yScale));
    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale));
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>MSE Plot</h3>
      <svg ref={mseSvgRef} width={500} height={300}></svg>
    </div>
  );
}
