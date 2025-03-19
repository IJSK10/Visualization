"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchPCAData } from "../utils/api";
import ToggleSwitch from '../components/toggleswitch';
import React from 'react';


export default function ScreePlot({ dimensionality, setDimensionality, component1, component2, changeComp, changeComponent, compbool,}) {
  const svgRef = useRef();
  const [eigenvalues, setEigenvalues] = useState([]);

  useEffect(() => {
    fetchPCAData().then((res) => {
      setEigenvalues(res.eigenvalues);
      drawScreePlot(res.eigenvalues, component1, component2, changeComponent);
    });
  }, [dimensionality, component1, component2, compbool]);

  const drawScreePlot = (eigenvalues, component1, component2, changeComponent) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

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
      .data(eigenvalues)
      .enter()
      .append("rect")
      .attr("x", (_, i) => xScale(i + 1))
      .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d))
      .attr("fill", (_, i) => (i + 1 === dimensionality ? "orange" : "steelblue"))
      .attr("stroke", (_, i) => (i === component1 || i === component2 ? "red" : "none"))
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (j, i) => {
        for (let k=0;k<eigenvalues.length;k++)
        {
          if (eigenvalues[k]===i)
          {
            setDimensionality(k + 1);
            break;
          }
        }
  }).on("contextmenu", (event, i) => {
    event.preventDefault(); 
    for (let k = 0; k < eigenvalues.length; k++) {
      if (eigenvalues[k] === i) {
        changeComponent(k);
        break;
      }
    }
  });;

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

    g.selectAll(".dot")
      .data(eigenvalues)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(i + 1) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d))
      .attr("r", 4)
      .attr("fill", "lightgreen")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .text(`Value: ${d}`)
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
    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale));

    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10) 
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "black")
    .text("Principal Component Index");

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15) 
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "black")
    .text("Eigenvalues");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-2 mb-8 justify-center">
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

      <div className="flex justify-center">
        <div className="flex flex-col justify-center items-center mr-4 h-60 gap-4">
          <ToggleSwitch checked={compbool} onChange={changeComp} text="PCA1" />
        </div>
        <svg ref={svgRef} width={400} height={300}></svg>
      </div>
    </div>
  );
}
