import { memo, useLayoutEffect, useRef } from "react";
import * as d3 from "d3";
import "./scatterplot.css";
import driving from "./driving.json";

const ConnectedScatterplot = memo(() => {
  const svgRef = useRef();
  const renderCount = useRef(0);

  useLayoutEffect(() => {
    renderCount.current += 1;
    if (renderCount.current === 1) {
      // Declare the chart dimensions and margins.
      const width = 928;
      const height = 720;
      const marginTop = 20;
      const marginRight = 30;
      const marginBottom = 30;
      const marginLeft = 40;

      // Create a tooltip
      let tooltip = d3
        .select("body")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("cursor", "pointer")
        .style("background", "antiquewhite")
        .style("padding", "6px")
        .style("border-radius", "7px")
        .style("font-size", "14px")
        .text("Tooltip text");

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      // Declare the positional encodings.

      const x = d3
        .scaleLinear()
        .domain(d3.extent(driving, (d) => d.miles))
        .nice()
        .range([marginLeft, width - marginRight]);

      const y = d3
        .scaleLinear()
        .domain(d3.extent(driving, (d) => d.gas))
        .nice()
        .range([height - marginBottom, marginTop]);

      const line = d3
        .line()
        .curve(d3.curveCatmullRom)
        .x((d) => x(d.miles))
        .y((d) => y(d.gas));

      const l = length(line(driving));
      svg // generate y axis UI
        .append("g")
        .attr("class", "x axis") // add class for X axis
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g // generating grid lines vertically on x axis
            .selectAll(".tick line")
            .clone()
            .attr("y2", -height)
            .attr("id", "y-line")
            .attr("stroke-opacity", 0.1)
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "currentColor")
            .text("Miles per person per year")
        );

      svg // generate x axis UI
        .append("g")
        .attr("class", "y axis") // add class for Y axis
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "$.2f"))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g // generating grid lines horizontally on y axis
            .selectAll(".tick line")
            .clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1)
        )
        .call((g) =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Cost per gallon")
        );

      svg // generating line
        .append("path")
        .datum(driving)
        .attr("fill", "none")
        .attr("id", "svg-line")
        .attr("stroke", "black")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${l}`)
        .attr("d", line)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l},${l}`);

      svg // generate circular points
        .append("g")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(driving)
        .join("circle")
        .attr("cx", (d) => x(d.miles))
        .attr("cy", (d) => y(d.gas))
        .attr("r", 3)
        .on("mouseover", function (event, d) {
          d3.select(this).style("cursor", "pointer");
          tooltip
            .text(d?.miles)
            .style("top", event.pageY - 15 + "px")
            .style("left", event.pageX + 10 + "px");
          return tooltip.style("visibility", "visible");
        })
        .on("mouseout", function (d) {
          return tooltip.style("visibility", "hidden");
        });

      const label = svg // point-values
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll()
        .data(driving)
        .join("text")
        .attr("transform", (d) => `translate(${x(d.miles)},${y(d.gas)})`)
        .attr("id", "point-value")
        .attr("fill-opacity", 0)
        .text((d) => d.year)
        .attr("stroke", "white")
        .attr("paint-order", "stroke")
        .attr("fill", "currentColor")
        .each(function (d) {
          const t = d3.select(this);
          switch (d.side) {
            case "top":
              t.attr("text-anchor", "middle").attr("dy", "-0.7em");
              break;
            case "right":
              t.attr("dx", "0.5em")
                .attr("dy", "0.32em")
                .attr("text-anchor", "start");
              break;
            case "bottom":
              t.attr("text-anchor", "middle").attr("dy", "1.4em");
              break;
            case "left":
              t.attr("dx", "-0.5em")
                .attr("dy", "0.32em")
                .attr("text-anchor", "end");
              break;
          }
        });

      label
        .transition()
        .delay(
          (d, i) => (length(line(driving.slice(0, i + 1))) / l) * (5000 - 125)
        )
        .attr("fill-opacity", 1);

      // Assuming you have defined your x and y scales, and your svg
      let zoom = d3
        .zoom()
        .scaleExtent([1, 2]) // This control how much you can unzoom (x1) and zoom (x10)
        .on("zoom", zoomed);

      svg.call(zoom);

      function zoomed(event) {
        // create new scale objects based on event
        var new_xScale = event.transform.rescaleX(x);
        var new_yScale = event.transform.rescaleY(y);
        svg
          .select("#svg-line")
          .attr(
            "transform",
            "translate(" +
              event.transform.x +
              "," +
              event.transform.y +
              ") scale(" +
              event.transform.k +
              ")"
          );
        // update axes
        svg.select(".x.axis").call(d3.axisBottom(new_xScale));
        svg.select(".y.axis").call(d3.axisLeft(new_yScale));

        // update circle positions
        svg
          .selectAll("circle")
          .attr("cx", function (d) {
            return new_xScale(d.miles);
          })
          .attr("cy", function (d) {
            return new_yScale(d.gas);
          });

        // update point values
        svg
          .selectAll("#point-value")
          .attr(
            "transform",
            (d) =>
              `translate(${new_xScale(d.miles)},${new_yScale(d.gas)}) scale(${
                event.transform.k
              })`
          );

        // update grid lines
        svg.select(".x.axis").call((g) => {
          console.log("g", g.selectAll(".tick line"));
        });

        // Update the x and y scales
        // x.domain(new_xScale.domain());
        // y.domain(new_yScale.domain());
      }

      let initialOpacity = 0;

      function fadeInArea() {
        d3.select(this)
          .transition(500)
          .attr("filter", "url(#shadow-filter-1)")
          .style("cursor", "pointer");
        d3.select(this).select("path").transition(500).style("opacity", 0.7);
      }

      function fadeOutArea() {
        d3.select(this)
          .transition(500)
          .attr("filter", null)
          .style("cursor", "default");
        d3.select(this)
          .select("path")
          .transition(500)
          .style("opacity", initialOpacity);
      }
    }
    return () => {
      console.log("Unmounting ConnectedScatterplot");
    };
  }, []);

  return (
    <>
      <svg ref={svgRef} id="d3-scatter-plot"></svg>
    </>
  );
});

export default ConnectedScatterplot;

const length = (path) =>
  d3.create("svg:path").attr("d", path).node().getTotalLength();
