import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const VariablesMDS_Plot = ({ data, onVariableClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.variables || !data.x || !data.y) return;

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
    
    // Draw points
    const points = svg.selectAll("circle")
      .data(data.variables.map((variable, i) => ({ 
        variable, 
        x: data.x[i], 
        y: data.y[i] 
      })))
      .join("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7)
      .attr("cursor", "pointer")
      .on("click", function(event, d) {
        // Highlight selected point
        d3.selectAll("circle").attr("fill", "steelblue").attr("r", 5);
        d3.select(this).attr("fill", "red").attr("r", 7);
        
        // Call the callback
        if (onVariableClick) onVariableClick(d.variable);
      });
      
    // Add variable labels
    svg.selectAll(".variable-label")
      .data(data.variables.map((variable, i) => ({ 
        variable, 
        x: data.x[i], 
        y: data.y[i] 
      })))
      .join("text")
      .attr("class", "variable-label")
      .attr("x", d => x(d.x) + 8)
      .attr("y", d => y(d.y) + 4)
      .text(d => d.variable)
      .style("font-size", "10px");
    
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
      .text(`Variables MDS Plot (1-|correlation| distance)`);
      
    // Add instruction text
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 30)
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-style", "italic")
      .text("Click on variables to define PCP axis ordering");
      
  }, [data, onVariableClick]);

  return (
    <div className="variables-mds-plot">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default VariablesMDS_Plot;