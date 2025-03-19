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
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(d3.range(1, mseScores.length + 1))
      .range([0, innerWidth])
      .padding(0.2);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(mseScores)])
      .nice()
      .range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("color", "#000")
      .style("font-weight", "bold")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px 10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("visibility", "hidden")
      .style("pointer-events", "none");

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
        for (let k = 0; k < mseScores.length; k++) {
          if (mseScores[k] === i) {
            onKChange(k + 1);
            break;
          }
        }
      });

    const line = d3
      .line()
      .x((_, i) => xScale(i + 1) + xScale.bandwidth() / 2)
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(mseScores)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.selectAll("circle")
      .data(mseScores)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(i + 1) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d))
      .attr("r", 4)
      .attr("fill", "black")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .text(`MSE: ${d}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    g.append("g").call(d3.axisLeft(yScale));
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Number of Clusters");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("MSE");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>MSE Plot</h3>
      <svg ref={mseSvgRef} width={500} height={300}></svg>
    </div>
  );
}
