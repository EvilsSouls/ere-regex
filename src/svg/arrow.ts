import {replaceStringAtIndex} from "../generic_functions";

export default class Arrow {
    arrow: SVGPathElement;
    svgImage: SVGSVGElement;
    type: "straight" | "bezier";
    
    constructor(svgImage: SVGSVGElement, x: number, y: number, targetX: number, targetY: number, ctrlpntX: number, ctrlpntY: number, type: "bezier")
    constructor(svgImage: SVGSVGElement, x: number, y: number, targetX: number, targetY: number, type: "straight")
    constructor(svgImage: SVGSVGElement, x: number, y: number, targetX: number, targetY: number, ctrlpntXOrType: number | "straight", ctrlpntY?: number, tempType?: "bezier") {
        let type: "straight" | "bezier" | undefined;
        let ctrlpntX: number | undefined;
        if(!tempType) {type = ctrlpntXOrType as "straight";} else {ctrlpntX = ctrlpntXOrType as number; type = tempType}
        this.arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");

        if(type === "straight") {this.arrow.setAttribute("d", "M 0 0 L 0 0");} else {this.arrow.setAttribute("d", "M 0 0 Q 0 0 0 0");}

        this.svgImage = svgImage;
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.type = type;
        if(this.type === "bezier") {
            this.ctrlpntX = ctrlpntX as number;
            this.ctrlpntY = ctrlpntY as number;
        }

        svgImage.appendChild(this.arrow);
    }

    set x(x: number) {
        let originalPathData = this.arrow.getAttribute("d") as string;

        this.arrow.setAttribute("d", replaceStringAtIndex(originalPathData, `${x}`, 2));
    }

    get x(): number {
        return(parseInt(this.arrow.getAttribute("d") as string[2]), 10);
    }

    set y(y: number) {
        let originalPathData = this.arrow.getAttribute("d") as string;

        this.arrow.setAttribute("d", replaceStringAtIndex(originalPathData, `${y}`, 4));
    }

    get y(): number {
        return(parseInt(this.arrow.getAttribute("d") as string[4]), 10);
    }

    set targetX(x: number) {
        let originalPathData = this.arrow.getAttribute("d") as string;

        this.arrow.setAttribute("d", replaceStringAtIndex(originalPathData, `${x}`, 8));
    }

    get targetX(): number {
        return(parseInt(this.arrow.getAttribute("d") as string[8]), 10);
    }

    set targetY(y: number) {
        let originalPathData = this.arrow.getAttribute("d") as string;

        this.arrow.setAttribute("d", replaceStringAtIndex(originalPathData, `${y}`, 10));
    }

    get targetY(): number {
        return(parseInt(this.arrow.getAttribute("d") as string[10]), 10);
    }

    set ctrlpntX(x: number) {
        if(this.type !== "bezier") {throw new Error("Cannot assign ctrlpntX, because type is not bezier");}

        let originalPathData = this.arrow.getAttribute("d") as string;

        this.arrow.setAttribute("d", replaceStringAtIndex(originalPathData, `${x}`, 12));
    }

    get ctrlpntX(): number {
        if(this.type !== "bezier") {throw new Error("Cannot get ctrlpntX, because type is not bezier");}
        return(parseInt(this.arrow.getAttribute("d") as string[12]), 10);
    }

    set ctrlpntY(y: number) {
        if(this.type !== "bezier") {throw new Error("Cannot assign ctrlpntY, because type is not bezier");}
        let originalPathData = this.arrow.getAttribute("d") as string;

        this.arrow.setAttribute("d", replaceStringAtIndex(originalPathData, `${y}`, 14));
    }

    get ctrlpntY(): number {
        if(this.type !== "bezier") {throw new Error("Cannot get ctrlpntY, because type is not bezier");}
        return(parseInt(this.arrow.getAttribute("d") as string[2]), 14);
    }
}