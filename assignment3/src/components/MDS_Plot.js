import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MDS_Plot = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.x || !data.y || !data.cluster_id) return;

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([d3.min(data.x), d3.max(data.x)])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([d3.min(data.y), d3.max(data.y)])
      .range([height, 0]);
    
    // Color scale for clusters
    const uniqueClusters = [...new Set(data.cluster_id)];
    const color = d3.scaleOrdinal()
      .domain(uniqueClusters)
      .range(d3.schemeCategory10);
    
    // Draw points
    svg.selectAll("circle")
      .data(data.x.map((x, i) => ({ x, y: data.y[i], cluster: data.cluster_id[i] })))
      .join("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 4)
      .attr("fill", d => color(d.cluster))
      .attr("opacity", 0.7)
      .append("title")
      .text(d => `Cluster: ${d.cluster}`);
    
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .text("MDS Dimension 1");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .style("text-anchor", "middle")
      .text("MDS Dimension 2");
      
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(`Data MDS Plot (Stress: ${data.stress?.toFixed(4) || 'N/A'})`);
      
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, 10)`);
      
    uniqueClusters.forEach((cluster, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color(cluster));
        
      legend.append("text")
        .attr("x", 15)
        .attr("y", i * 20 + 9)
        .text(`Cluster ${cluster}`)
        .style("font-size", "12px");
    });
    
  }, [data]);

  return (
    <div className="mds-plot">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default MDS_Plot;