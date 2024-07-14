import Rectangle from "../svg/rectangle";
import Arrow from "../svg/arrow";

const svgns = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgns, "svg");

/*const rectangle = document.createElementNS(svgns, "rect");
rectangle.setAttribute("x", "50");
rectangle.setAttribute("y", "50");
rectangle.setAttribute('height', '25');
rectangle.setAttribute('width', '25');
rectangle.setAttribute('fill', "#000000");
svg.appendChild(rectangle);*/

const divElement = document.getElementById("content-container");
divElement?.appendChild(svg);

new Rectangle(svg, 50, 50, 25, 25);
new Arrow(svg, 75, 75, 100, 50, "straight");