"use client";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const CategoricalPCPPlot = () => {
  const [data, setData] = useState([]);
  const [categoricalColumns, setCategoricalColumns] = useState({});
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/pcp_data")
      .then((response) => response.json())
      .then((json) => {
        setData(json.data);
        setCategoricalColumns(json.categorical_columns);
        
        // Extract unique cluster IDs
        const uniqueClusters = [...new Set(json.data.map((d) => d.Cluster_ID))];
        setClusters(uniqueClusters);
      })
      .catch((error) => console.error("Error fetching PCP data:", error));
  }, []);

  useEffect(() => {
    if (data.length === 0 || Object.keys(categoricalColumns).length === 0) return;
    
    d3.select("#categorical-pcp-svg").selectAll("*").remove();
    
    const margin = { top: 50, right: 70, bottom: 50, left: 70 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = d3
      .select("#categorical-pcp-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Background color
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "black");
    
    // Select categorical columns to display
    const selectedCategories = Object.keys(categoricalColumns).slice(0, 7); // Display first 7 categories
    
    // Define the x scale (categorical dimensions)
    const xScale = d3.scalePoint()
      .domain(selectedCategories)
      .range([0, width]);
    
    // Define y scales for each categorical dimension
    const yScales = {};
    selectedCategories.forEach((col) => {
      // Use the categories from the categorical_columns object
      const categories = categoricalColumns[col] || [];
      
      yScales[col] = d3.scalePoint()
        .domain(categories)
        .range([height, 0])
        .padding(0.5);
    });
    
    // Define color scale based on cluster ID
    const colorScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3])
      .range(["#3498db", "#f39c12", "#2ecc71", "#e74c3c"]); // Blue, Orange, Green, Red
    
    // Process the data to ensure all necessary values exist
    const processedData = data.map(d => {
      const item = {...d};
      // For each categorical column, ensure there's a valid value
      selectedCategories.forEach(col => {
        if (!item[col] || yScales[col](item[col]) === undefined) {
          // If missing or invalid, set to a default value from the scale
          const domainValues = yScales[col].domain();
          if (domainValues.length > 0) {
            item[col] = domainValues[0]; // Use first value as default
          }
        }
      });
      return item;
    });
    
    // Draw the lines using d3.line
    svg.selectAll(".line")
      .data(processedData)
      .enter()
      .append("path")
      .attr("d", d => {
        return d3.line()
          .x(dimension => xScale(dimension))
          .y(dimension => yScales[dimension](d[dimension]))
          (selectedCategories);
      })
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.Cluster_ID))
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7);
    
    // Draw a line for each dimension
    selectedCategories.forEach(dimension => {
      svg.append("line")
        .attr("x1", xScale(dimension))
        .attr("x2", xScale(dimension))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    });
    
    // Draw axes for each dimension
    selectedCategories.forEach(col => {
      const axis = d3.axisLeft(yScales[col])
        .tickSize(0);
      
      const axisGroup = svg.append("g")
        .attr("transform", `translate(${xScale(col)},0)`)
        .call(axis);
      
      // Remove the domain path
      axisGroup.select(".domain").remove();
      
      // Add axis label
      axisGroup.append("text")
        .attr("y", -15)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(col);
      
      // Style axis text
      axisGroup.selectAll("text")
        .attr("fill", "white")
        .attr("transform", "rotate(-30)")
        .attr("text-anchor", "end")
        .attr("font-size", "10px");
    });
    
    // Add legend
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
    
  }, [data, categoricalColumns, clusters]);
  
  return (
    <div>
      <h3 style={{ color: 'white', backgroundColor: 'black', padding: '10px' }}>
        Categorical Parallel Coordinates Plot
      </h3>
      <div style={{ backgroundColor: 'black', padding: '10px' }}>
        <svg id="categorical-pcp-svg"></svg>
      </div>
    </div>
  );
};

export default CategoricalPCPPlot;