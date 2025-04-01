"use client";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const PCPPlot = () => {
  const [data, setData] = useState([]);
  const [numericalColumns, setNumericalColumns] = useState([]);
  const [clusters, setClusters] = useState([]); // Store unique cluster IDs

  useEffect(() => {
    fetch("http://127.0.0.1:5001/pcp_data")
      .then((response) => response.json())
      .then((json) => {
        setData(json.data);
        setNumericalColumns(json.numerical_columns);

        // Extract unique cluster IDs
        const uniqueClusters = [...new Set(json.data.map((d) => d.Cluster_ID))];
        setClusters(uniqueClusters);
      })
      .catch((error) => console.error("Error fetching PCP data:", error));
  }, []);

  useEffect(() => {
    if (data.length === 0 || numericalColumns.length === 0) return;

    d3.select("#pcp-svg").selectAll("*").remove();

    const margin = { top: 30, right: 50, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#pcp-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scalePoint()
      .domain(numericalColumns)
      .range([0, width]);

    const yScales = {};
    numericalColumns.forEach((col) => {
      yScales[col] = d3.scaleLinear()
        .domain(d3.extent(data, (row) => +row[col] || 0))
        .range([height, 0]);
    });

    // Define color scale based on cluster ID
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(clusters);

    // Define line function
    const line = d3.line()
      .x((d) => xScale(d.dimension))
      .y((d) => d.value);

    // Draw lines, colored by cluster
    svg.selectAll(".line")
      .data(data)
      .enter()
      .append("path")
      .attr("d", (row) =>
        line(numericalColumns.map((col) => ({
          dimension: col,
          value: yScales[col](+row[col] || 0)
        })))
      )
      .attr("fill", "none")
      .attr("stroke", (d) => colorScale(d.Cluster_ID))
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6);

    // Draw axes
    svg.selectAll(".axis")
      .data(numericalColumns)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${xScale(d)},0)`)
      .each(function (d) { d3.select(this).call(d3.axisLeft(yScales[d])); })
      .append("text")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text((d) => d)
      .attr("fill", "black");

  }, [data, numericalColumns, clusters]);

  return (
    <div>
      <h3>Parallel Coordinates Plot (Colored by Cluster)</h3>
      <svg id="pcp-svg"></svg>
    </div>
  );
};

export default PCPPlot;
