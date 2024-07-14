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
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        pathDataArray[1] = `${x}`;

        this.arrow.setAttribute("d", pathDataArray.join(" "));
    }

    get x(): number {
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        return(parseInt(pathDataArray[1]), 10);
    }

    set y(y: number) {
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        pathDataArray[2] = `${y}`;

        this.arrow.setAttribute("d", pathDataArray.join(" "));
    }

    get y(): number {
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        return(parseInt(pathDataArray[2]), 10);
    }

    set targetX(x: number) {
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        pathDataArray[4] = `${x}`;

        this.arrow.setAttribute("d", pathDataArray.join(" "));
    }

    get targetX(): number {
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        return(parseInt(pathDataArray[4]), 10);
    }

    set targetY(y: number) {
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        pathDataArray[5] = `${y}`;

        this.arrow.setAttribute("d", pathDataArray.join(" "));
    }

    get targetY(): number {
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        return(parseInt(pathDataArray[5]), 10);
    }

    set ctrlpntX(x: number) {
        if(this.type !== "bezier") {throw new Error("Cannot assign ctrlpntX, because type is not bezier");}

        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        pathDataArray[6] = `${x}`;

        this.arrow.setAttribute("d", pathDataArray.join(" "));
    }

    get ctrlpntX(): number {
        if(this.type !== "bezier") {throw new Error("Cannot get ctrlpntX, because type is not bezier");}
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        return(parseInt(pathDataArray[6]), 10);
    }

    set ctrlpntY(y: number) {
        if(this.type !== "bezier") {throw new Error("Cannot assign ctrlpntY, because type is not bezier");}

        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        pathDataArray[7] = `${y}`;

        this.arrow.setAttribute("d", pathDataArray.join(" "));
    }

    get ctrlpntY(): number {
        if(this.type !== "bezier") {throw new Error("Cannot get ctrlpntY, because type is not bezier");}
        const pathDataArray = this.arrow.getAttribute("d")?.split(" ") as string[];
        return(parseInt(pathDataArray[7]), 14);
    }
}