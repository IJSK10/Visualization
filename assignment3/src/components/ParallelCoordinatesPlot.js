import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ParallelCoordinatesPlot = ({ data, columnOrder, setColumnOrder }) => {
  const svgRef = useRef();
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [dragStartColumn, setDragStartColumn] = useState(null);

  useEffect(() => {
    if (!data || !data.data || !data.columns || !columnOrder) return;

    const width = 900;
    const height = 500;
    const margin = { top: 50, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Use provided column order or default to all columns
    const orderedColumns = columnOrder.length > 0 ? 
      columnOrder : 
      data.columns;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
      
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Color scale for clusters
    const uniqueClusters = [...new Set(data.data.map(d => d.cluster_id))];
    const colorScale = d3.scaleOrdinal()
      .domain(uniqueClusters)
      .range(d3.schemeCategory10);
    
    // Create scales for each dimension
    const yScales = {};
    
    orderedColumns.forEach(column => {
      const columnType = data.column_types[column];
      
      if (columnType === 'numeric') {
        // Numeric scale
        const min = data.column_types[`${column}_min`];
        const max = data.column_types[`${column}_max`];
        
        yScales[column] = d3.scaleLinear()
          .domain([min, max])
          .range([innerHeight, 0]);
      } else {
        // Categorical scale
        const categories = data.column_types[`${column}_values`] || [];
        
        yScales[column] = d3.scalePoint()
          .domain(categories)
          .range([innerHeight, 0])
          .padding(0.5);
      }
    });
    
    // Create x scale for dimensions
    const xScale = d3.scalePoint()
      .domain(orderedColumns)
      .range([0, innerWidth])
      .padding(1);
    
    // Draw axes
    orderedColumns.forEach(column => {
      const axis = chart.append("g")
        .attr("transform", `translate(${xScale(column)},0)`)
        .attr("class", "dimension")
        .call(d3.axisLeft(yScales[column]))
        .style("cursor", "move");
      
      // Add axis title
      axis.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .text(column)
        .style("fill", "black")
        .style("font-size", "12px");
        
      // Add drag behavior for reordering
      axis.call(d3.drag()
        .on("start", function(event) {
          setDragStartColumn(column);
        })
        .on("drag", function(event) {
          // Visual feedback during dragging
          d3.select(this).attr("opacity", 0.5)
            .attr("transform", `translate(${event.x},0)`);
        })
        .on("end", function(event, d) {
          d3.select(this).attr("opacity", 1);
          
          // Find the nearest column
          const dragX = event.x;
          let nearestColumn = orderedColumns[0];
          let minDistance = Infinity;
          
          orderedColumns.forEach(col => {
            const distance = Math.abs(xScale(col) - dragX);
            if (distance < minDistance) {
              minDistance = distance;
              nearestColumn = col;
            }
          });
          
          // Reorder columns
          if (nearestColumn !== dragStartColumn) {
            const newOrder = [...orderedColumns];
            const dragIdx = newOrder.indexOf(dragStartColumn);
            const dropIdx = newOrder.indexOf(nearestColumn);
            
            newOrder.splice(dragIdx, 1);
            newOrder.splice(dropIdx, 0, dragStartColumn);
            
            setColumnOrder(newOrder);
          } else {
            // Reset position if not moved
            d3.select(this)
              .attr("transform", `translate(${xScale(column)},0)`);
          }
        })
      );
    });
    
    // Draw polylines
    const line = d3.line()
      .defined((d, i) => d !== null)
      .x((d, i) => xScale(orderedColumns[i]))
      .y((d, i) => {
        const column = orderedColumns[i];
        return yScales[column](d);
      });
      
    data.data.forEach(dataPoint => {
      const isSelected = selectedClusters.length === 0 || 
                         selectedClusters.includes(dataPoint.cluster_id);
      
      const lineData = orderedColumns.map(col => 
        dataPoint.values[col] !== undefined ? dataPoint.values[col] : null
      );
      
      chart.append("path")
        .datum(lineData)
        .attr("class", "polyline")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScale(dataPoint.cluster_id))
        .attr("stroke-width", 1)
        .attr("opacity", isSelected ? 0.7 : 0.1);
    });
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);
      
    uniqueClusters.forEach((cluster, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`)
        .style("cursor", "pointer")
        .on("click", () => {
          // Toggle cluster selection
          setSelectedClusters(prev => {
            if (prev.includes(cluster)) {
              return prev.filter(c => c !== cluster);
            } else {
              return [...prev, cluster];
            }
          });
        });
      
      legendRow.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(cluster));
        
      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 9)
        .text(`Cluster ${cluster}`)
        .style("font-size", "12px");
    });
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Parallel Coordinates Plot");
    
    // Add instructions
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-style", "italic")
      .text("Drag axis labels to reorder. Click on legend to filter clusters.");
    
  }, [data, columnOrder, setColumnOrder, selectedClusters]);

  return (
    <div className="parallel-coordinates-plot">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ParallelCoordinatesPlot;