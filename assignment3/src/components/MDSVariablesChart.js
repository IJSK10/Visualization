"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";

const MDSVariablesChart = ({ order, mdsOrder, setOrder, setMdsOrder }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/mds_variables")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 400, height = 300, margin = 100;

    d3.select("#mdsVariables").selectAll("*").remove();

    const svg = d3.select("#mdsVariables")
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

    const handleClick = (variable) => {
      if (mdsOrder.includes(variable)) {
        setMdsOrder(mdsOrder.filter(v => v !== variable));
        setOrder([variable, ...order]);
      } else {
        setOrder(order.filter(v => v !== variable));
        setMdsOrder([...mdsOrder, variable]);
      }
    };

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", d => (mdsOrder.includes(d.variable) ? "red" : "steelblue")) 
      .style("cursor", "pointer")
      .on("click", (_, d) => handleClick(d.variable)); 

    svg.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.x) + 8)
      .attr("y", d => yScale(d.y) - 5)
      .text(d => d.variable)
      .attr("font-size", "12px")
      .attr("fill", "black");

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

  }, [data, order, mdsOrder, setMdsOrder, setOrder]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-center text-xl font-bold mb-4">MDS Variables Scatterplot</h2>
      <svg id="mdsVariables"></svg>
    </div>
  );
};

export default MDSVariablesChart;
