export default class Arrow {
    arrow: SVGPathElement;
    svgImage: SVGSVGElement;
    type: "straight" | "bezier";
    private labelEl!: SVGTextElement;
    
    constructor(svgImage: SVGSVGElement, label: string, x: number, y: number, targetX: number, targetY: number, ctrlpntX: number, ctrlpntY: number, type: "bezier")
    constructor(svgImage: SVGSVGElement, label: string, x: number, y: number, targetX: number, targetY: number, type: "straight")
    constructor(svgImage: SVGSVGElement, label: string, x: number, y: number, targetX: number, targetY: number, ctrlpntXOrType: number | "straight", ctrlpntY?: number, tempType?: "bezier") {
        let type: "straight" | "bezier" | undefined;
        let ctrlpntX: number | undefined;
        if(!tempType) {type = ctrlpntXOrType as "straight";} else {ctrlpntX = ctrlpntXOrType as number; type = tempType}
        this.arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");

        if(type === "straight") {this.arrow.setAttribute("d", "M 0 0 L 0 0");} else {this.arrow.setAttribute("d", "M 0 0 Q 0 0 0 0");}
        this.arrow.setAttribute("style", "fill:none;stroke:black;stroke-width:3");

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
        this.label = label;

        if(!document.getElementById("arrow-head")) {
            const definitions = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            
            const arrowMarkerEl = document.createElementNS("http://www.w3.org/2000/svg", "marker");
            arrowMarkerEl.id = "arrow-head";
            arrowMarkerEl.setAttribute("markerWidth", "10");
            arrowMarkerEl.setAttribute("markerHeight", "10");
            arrowMarkerEl.setAttribute("refX", "5");
            arrowMarkerEl.setAttribute("refY", "5");
            arrowMarkerEl.setAttribute("refX", "5");
            arrowMarkerEl.setAttribute("orient", "auto");

            const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
            arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
            arrow.setAttribute("fill", "black");

            arrowMarkerEl.appendChild(arrow);
            definitions.appendChild(arrowMarkerEl);
            svgImage.appendChild(definitions);
        }

        this.arrow.setAttribute("marker-end", "url(#arrow-head)");

        svgImage.appendChild(this.arrow);
        svgImage.appendChild(this.labelEl);
    }

    set label(label: string) {
        if(!this.labelEl) {
            this.labelEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.labelEl.setAttribute("style", "fill:black;font-size:25px");

            const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
            textPath.setAttribute("path", this.arrow.getAttribute("d") as string);

            this.labelEl.appendChild(textPath);
        }

        const textPath = this.labelEl.firstChild as SVGTextPathElement;
        textPath.textContent = label;
    }

    get label(): string {
        const textPath = this.labelEl.firstChild as SVGTextPathElement;
        return(textPath.textContent as string);
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