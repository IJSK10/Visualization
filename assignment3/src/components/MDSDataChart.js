"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";

const MDSDataChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/mds_data")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 500, height = 500;
    const svg = d3.select("#mdsData")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f9f9f9");

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([height - 50, 50]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", d => colorScale(d.cluster));

  }, [data]);

  return (
    <div>
      <h2>MDS Data Scatterplot</h2>
      <svg id="mdsData"></svg>
    </div>
  );
};

export default MDSDataChart;
