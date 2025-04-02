"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";

const MDSDataChart = ({k}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/mds_data")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [k]);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 500, height = 400, margin = 50;

    d3.select("#mdsData").selectAll("*").remove();

    const svg = d3.select("#mdsData")
      .attr("width", width + margin * 2)
      .attr("height", height + margin * 2)
      .append("g")
      .attr("transform", `translate(${margin}, ${margin})`);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", d => colorScale(d.cluster));

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Component 1");

    svg.append("g")
      .call(d3.axisLeft(yScale));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Component 2");

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, 10)`);

    const uniqueClusters = [...new Set(data.map(d => d.cluster))];

    uniqueClusters.forEach((cluster, i) => {
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", i * 20)
        .attr("r", 5)
        .attr("fill", colorScale(cluster));

      legend.append("text")
        .attr("x", 10)
        .attr("y", i * 20 + 4)
        .text("cluster "+cluster)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });

  }, [data]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-center text-xl font-bold mb-4">MDS Data Scatterplot</h2>
      <svg id="mdsData"></svg>
    </div>
  );
};

export default MDSDataChart;
