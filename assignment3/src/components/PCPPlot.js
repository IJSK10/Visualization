"use client";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const CombinedPCPPlot = () => {
  const [data, setData] = useState([]);
  const [numericalColumns, setNumericalColumns] = useState([]);
  const [categoricalColumns, setCategoricalColumns] = useState({});
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/pcp_data")
      .then((response) => response.json())
      .then((json) => {
        setData(json.data);
        setNumericalColumns(json.numerical_columns);
        setCategoricalColumns(json.categorical_columns);
        
        const uniqueClusters = [...new Set(json.data.map((d) => d.Cluster_ID))];
        setClusters(uniqueClusters);
      })
      .catch((error) => console.error("Error fetching PCP data:", error));
  }, []);

  useEffect(() => {
    if (data.length === 0 || (numericalColumns.length === 0 && Object.keys(categoricalColumns).length === 0)) return;
    
    d3.select("#combined-pcp-svg").selectAll("*").remove();
    
    const margin = { top: 50, right: 70, bottom: 50, left: 70 };
    const width = 1600 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;
    
    const svg = d3
      .select("#combined-pcp-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const allColumns = [...numericalColumns, ...Object.keys(categoricalColumns).slice(0, 7)];
    
    const xScale = d3.scalePoint()
      .domain(allColumns)
      .range([0, width]);
    
    const yScales = {};
    
    numericalColumns.forEach((col) => {
      yScales[col] = d3.scaleLinear()
        .domain(d3.extent(data, (row) => +row[col] || 0))
        .range([height, 0]);
    });
    
    Object.keys(categoricalColumns).slice(0, 7).forEach((col) => {
      yScales[col] = d3.scalePoint()
        .domain(categoricalColumns[col] || [])
        .range([height, 0])
        .padding(0.5);
    });
    
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(clusters);
    
    const processedData = data.map(d => {
      const item = { ...d };
      Object.keys(categoricalColumns).slice(0, 7).forEach(col => {
        if (!item[col] || yScales[col](item[col]) === undefined) {
          const domainValues = yScales[col].domain();
          if (domainValues.length > 0) item[col] = domainValues[0];
        }
      });
      return item;
    });
    
    svg.selectAll(".line")
      .data(processedData)
      .enter()
      .append("path")
      .attr("d", d => {
        return d3.line()
          .x(dim => xScale(dim))
          .y(dim => yScales[dim](d[dim]))
          (allColumns);
      })
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.Cluster_ID))
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7);
    
    allColumns.forEach(col => {
      svg.append("line")
        .attr("x1", xScale(col))
        .attr("x2", xScale(col))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    });
    
    allColumns.forEach(col => {
      const axis = d3.axisLeft(yScales[col]).tickSize(0);
      const axisGroup = svg.append("g")
        .attr("transform", `translate(${xScale(col)},0)`)
        .call(axis);
      axisGroup.select(".domain").remove();
      axisGroup.append("text")
        .attr("y", -15)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(col);
      axisGroup.selectAll("text")
        .attr("fill", "white")
        .attr("font-size", "10px");
    });
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, ${-30})`);
    
    clusters.forEach((cluster, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(cluster));
      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("fill", "white")
        .text(`Cluster ${cluster}`);
    });
  }, [data, numericalColumns, categoricalColumns, clusters]);

  return (
    <div>
      <h3>Combined Parallel Coordinates Plot</h3>
      <svg id="combined-pcp-svg"></svg>
    </div>
  );
};

export default CombinedPCPPlot;
