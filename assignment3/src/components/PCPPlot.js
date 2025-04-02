import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const PCPPlot = ({ order, mdsOrder, setOrder, k}) => {
  const svgRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/pcp_data")
      .then((response) => response.json())
      .then((json) => setData(json.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [k]);

  useEffect(() => {
    if (data.length === 0 || !order) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 80, right: 30, bottom: 80, left: 10 },
      width = 1450 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    const dimensions = [...mdsOrder,...order];

    const x = d3.scalePoint().domain(dimensions).range([0, width]).padding(1.5);
    const y = {};

    dimensions.forEach((dim) => {
      if (typeof data[0][dim] === "number") {
        y[dim] = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => +d[dim]))
          .range([height, 0]);
      } else {
        y[dim] = d3
          .scalePoint()
          .domain([...new Set(data.map((d) => d[dim]))])
          .range([height, 0]);
      }
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const line = d3.line().x((d) => x(d.dimension)).y((d) => y[d.dimension](d.value));

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("PCP Plot");

    g.selectAll(".line")
      .data(data)
      .enter()
      .append("path")
      .attr("d", (d) =>
        line(
          dimensions.map((dim) => ({ dimension: dim, value: d[dim] }))
        )
      )
      .style("fill", "none")
      .style("stroke", (d) => color(d.Cluster_ID))
      .style("opacity", 0.7);

    const axisGroups = g.selectAll(".axis")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x(d)},0)`)
      .each(function (d) {
        const axisGroup = d3.select(this);

        axisGroup.call(d3.axisLeft(y[d]).tickSize(6).tickPadding(10));

        axisGroup.selectAll(".tick text")
          .style("font-weight", "bold") 
          .each(function () {
            const text = d3.select(this);
            const words = text.text();
            text.text(""); 

            for (let i = 0; i < words.length; i += 14) {
              text.append("tspan")
                .attr("x", 0)
                .attr("dy", i === 0 ? "0em" : "1.2em")
                .text(words.slice(i, i + 14));
            }
          });
      });

    g.selectAll(".axis line, .axis path")
      .style("stroke", "black");

    const axisLabels = g.selectAll(".axis-label")
      .data(dimensions)
      .enter()
      .append("text")
      .attr("x", (d) => x(d))
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "14px")
      .style("cursor", "pointer")  // Make labels draggable
      .each(function(d) {
        if (d.length > 10) {
          const mid = Math.ceil(d.length / 2);
          const firstPart = d.slice(0, mid);
          const secondPart = d.slice(mid);
          d3.select(this).append("tspan").attr("x", x(d)).attr("dy", "0em").text(firstPart);
          d3.select(this).append("tspan").attr("x", x(d)).attr("dy", "1.2em").text(secondPart);
        } else {
          d3.select(this).text(d);
        }
      });

    axisLabels.call(d3.drag()
      .on("start", function(event, d) {
        d3.select(this).raise();
      })
      .on("drag", function(event, d) {
        const draggedIndex = dimensions.indexOf(d);
        const dropIndex = Math.floor(event.x / (width / dimensions.length));

        if (draggedIndex !== dropIndex) {
          const updatedOrder = [...dimensions];
          updatedOrder.splice(draggedIndex, 1);
          updatedOrder.splice(dropIndex, 0, d);

          setOrder(updatedOrder);

          d3.select(this).attr("transform", `translate(${x(d)},0)`);
        }
      })
      .on("end", function(event, d) {
        const draggedIndex = dimensions.indexOf(d);
        const dropIndex = Math.floor(event.x / (width / dimensions.length));

        if (draggedIndex !== dropIndex) {
          const updatedOrder = [...dimensions];
          updatedOrder.splice(draggedIndex, 1); 
          updatedOrder.splice(dropIndex, 0, d);

          setOrder(updatedOrder);
        }
      })
    );
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 70}, 10)`);

    const uniqueClusters = [...new Set(data.map(d => d.Cluster_ID))];

    uniqueClusters.forEach((cluster, i) => {
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", i * 20)
        .attr("r", 5)
        .attr("fill", color(cluster));

      legend.append("text")
        .attr("x", 10)
        .attr("y", i * 20 + 4)
        .text("cluster "+cluster)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });
  }, [data, order, mdsOrder, setOrder]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg ref={svgRef} width={1500} height={600}></svg>
    </div>
  );
};

export default PCPPlot;
