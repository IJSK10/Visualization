"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { fetchBiplotData } from "../utils/api";

export default function Biplot({ dimensionality, kValue ,comp1,comp2}) {
  const svgRef = useRef();

  useEffect(() => {
    fetchBiplotData(dimensionality, kValue,comp1,comp2)
      .then((res) => {
        console.log("API Response:", res);

        if (!res || !Array.isArray(res.points) || !Array.isArray(res.feature_vectors)) {
          console.error("Invalid response format:", res);
          return;
        }

        drawBiplot(res.points, res.feature_vectors,comp1,comp2);
      })
      .catch((error) => {
        console.error("Error fetching biplot data:", error);
      });
  }, [dimensionality, kValue,comp1,comp2]);

  const drawBiplot = (points, featureVectors,comp1,comp2) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!Array.isArray(points) || !Array.isArray(featureVectors)) {
      console.error("Invalid data passed to drawBiplot:", { points, featureVectors });
      return;
    }

    const width = 600,
      height = 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(points, (d) => d.x))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(points, (d) => d.y))
      .range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    g.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .attr("fill", (d) => colorScale(d.cluster))
      .attr("opacity", 0.8);

    g.selectAll("line")
      .data(featureVectors)
      .enter()
      .append("line")
      .attr("x1", innerWidth / 2)
      .attr("y1", innerHeight / 2)
      .attr("x2", (d) => innerWidth / 2 + d.dx * 200)
      .attr("y2", (d) => innerHeight / 2 - d.dy * 200)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    g.selectAll("text.feature-label")
      .data(featureVectors)
      .enter()
      .append("text")
      .attr("x", (d) => innerWidth / 2 + d.dx * 220)
      .attr("y", (d) => innerHeight / 2 - d.dy * 220)
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .text((d) => d.feature);

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 7)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "red");

    g.append("g").call(d3.axisLeft(yScale));
    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale));

    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text(`PCA${comp1+1}`);

    g.append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("transform", "rotate(-90)")
      .text(`PCA${comp2+1}`);

      const clusters = [...new Set(points.map((d) => d.cluster))];

      const legend = svg.append("g").attr("transform", `translate(${width - 100}, 50)`);

      clusters.forEach((cluster, i) => {
        legend
          .append("circle")
          .attr("cx", 0)
          .attr("cy", i * 20)
          .attr("r", 5)
          .attr("fill", colorScale(cluster));
  
        legend
          .append("text")
          .attr("x", 10)
          .attr("y", i * 20 + 4)
          .attr("font-size", "12px")
          .attr("fill", "black")
          .text(`Cluster ${cluster}`);
      });
  };

  return <svg ref={svgRef} width={600} height={500}></svg>;
}
