import * as d3 from "d3";
import { memo, useLayoutEffect, useRef } from "react";
import "./style.css";
import data from "../../data.json";

// let treeData = {
//   name: "T",
//   children: [
//     {
//       name: "A",
//       w: 100,
//       h: 100,
//       children: [
//         { name: "A1", s: 3 },
//         { name: "A2", s: 2 },
//         { name: "A3", s: 2 },
//         { name: "A4", s: 2 },
//         {
//           name: "C",
//           s: 1,

//           children: [
//             { name: "C1", s: 4 },
//             {
//               name: "D",
//               w: 100,
//               h: 100,
//               children: [
//                 { name: "D1", s: 10 },
//                 { name: "D2", s: 5 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//     { name: "Z", s: 2 },
//     {
//       name: "B",
//       s: 5,
//       children: [
//         { name: "B1", s: 6 },
//         { name: "B2", s: 6 },
//         { name: "B3", s: 6 },
//       ],
//     },
//   ],
// };
const D3Treeview = memo((props) => {
  const svgRef = useRef();
  const renderCount = useRef(0);
  const { nodeElement } = props;

  useLayoutEffect(() => {
    renderCount.current += 1;
    if (renderCount.current === 1) {
      let count = 0;
      let margin = { top: 280, right: 90, bottom: 30, left: 190 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
      let svg = d3
        .select(svgRef.current)
        .call(
          d3.zoom().on("zoom", function (event) {
            svg.attr(
              "transform",
              "translate(" +
                (event.transform.x + margin.left) +
                "," +
                (event.transform.y + margin.top) +
                ") scale(" +
                event.transform.k +
                ")"
            );
          })
        )
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      let i = 0,
        duration = 750,
        root;
      let treemap = d3
        .tree()
        .nodeSize([30, 70])
        .separation(function (a, b) {
          return a.parent == b.parent ? 1 : 2;
        });

      root = d3.hierarchy(data, function (d) {
        return d.children;
      });
      root.x0 = height / 2;
      root.y0 = 0;
      root.children.forEach(collapse);

      update(root);
      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

      function update(source) {
        let treeData = treemap(root);
        let nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);
        nodes.forEach(function (d) {
          d.y = d.depth * 180;
        });
        let node = svg.selectAll("g.node").data(nodes, function (d) {
          return d.id || (d.id = ++i);
        });
        let nodeEnter = node
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", function (d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
          })
          .on("click", (e, d) => {
            click(d);
          });

        nodeEnter
          .attr("class", "node")
          .attr("r", 1e-6)
          .style("fill", function (d) {
            return d.parent ? "rgb(39, 43, 77)" : "#fe6e9e";
          });

        nodeEnter
          .append("circle")
          .attr("r", 2.5)
          .attr("fill", (d) => (d._children ? "#555" : "#999"))
          .attr("stroke-width", 10);

        nodeEnter
          .append("text")
          .style("fill", function (d) {
            return "black";
          })
          .attr("dy", ".35em")
          .attr("x", (d) => (d._children ? -6 : 6))
          .attr("text-anchor", function (d) {
            return d._children ? "end" : "start";
          })
          .text(function (d) {
            return d.data.name;
          })
          .clone(true)
          .lower()
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .attr("stroke", "white");

        let nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
          .transition()
          .duration(duration)
          .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
          });
        let nodeExit = node
          .exit()
          .transition()
          .duration(duration)
          .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
          })
          .remove();

        nodeExit.select("rect").style("opacity", 1e-6);
        nodeExit.select("text").style("fill-opacity", 1e-6);
        let link = svg.selectAll("path.link").data(links, function (d) {
          return d.id;
        });
        let linkEnter = link
          .enter()
          .insert("path", "g")
          .attr("class", "link")
          .attr("d", function (d) {
            let o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
          });
        let linkUpdate = linkEnter.merge(link);
        linkUpdate
          .transition()
          .duration(duration)
          .attr("d", function (d) {
            return diagonal(d, d.parent);
          });
        let linkExit = link
          .exit()
          .transition()
          .duration(duration)
          .attr("d", function (d) {
            let o = { x: source.x, y: source.y };
            return diagonal(o, o);
          })
          .remove();
        nodes.forEach(function (d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
        function diagonal(s, d) {
          let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

          return path;
        }
        function click(d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }

          if (d.children == null && d._children == null) {
            // if leaf node
            // Add new child node here
            mockApiCall().then((res) => {
              let { newNodeData } = res.data;
              console.log(newNodeData);
              let newNode = d3.hierarchy(newNodeData, function (d) {
                return d.children;
              });

              newNode.parent = d;
              adjustDepth(newNode, d.depth + 1); // Adjusts the depth starting from 5
              adjustHeight(d, newNode.height + 1); // Adjusts the height starting from 5

              newNode.descendants().forEach((node, index) => {
                node.id = generateRandomId();
                node.y = node.depth * 180;
                node._children = node.children;
                node.children = null;
              });
              if (!d.children) {
                d.children = [];
                if (!d.data) {
                  d.data = {};
                }
                d.data.children = [];
              }
              // Push new node to children array
              d.children.push(newNode);
              d.data.children.push(newNode.data);
              update(d);
            });
          }
          update(d);
        }
      }
    }
  }, []);
  return (
    <>
      <svg ref={svgRef} id="d3-tree"></svg>
    </>
  );
});

export default D3Treeview;

function generateRandomId(length = 6) {
  // Generate a random number and convert it to a hexadecimal string.
  const randomBits = Math.floor(Math.random() * 16 ** length).toString(16);

  // Add enough padding to ensure the ID is the desired length.
  const padding = "0".repeat(length - randomBits.length);

  // Return the complete ID.
  return `${padding}${randomBits}`;
}

function mockApiCall() {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      const data = {
        message: "Hello, this is a mock API call!",
        status: 200,
        newNodeData: {
          name: "B4",
          children: [
            { name: "B5" },
            { name: "B6" },
            { name: "B7", children: [{ name: "B8" }, { name: "B9" }] },
          ],
        },
      };

      // Simulate a successful API call
      resolve({ data });
    }, 300);
  });
}

function adjustDepth(node, depthOffset) {
  node.depth += depthOffset;
  if (node.children) {
    node.children.forEach((child) => adjustDepth(child, depthOffset));
  }
}

function adjustHeight(node, heightOffset) {
  let newNode = { ...node, height: heightOffset };
  if (newNode.parent) {
    adjustHeight(newNode.parent, heightOffset + 1);
  }
}
