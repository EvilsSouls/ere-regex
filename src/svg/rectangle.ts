export default class Rectangle {
    rect: SVGRectElement;
    svgImage: SVGSVGElement;

    constructor(svgImage: SVGSVGElement, x: number, y: number, width: number, height: number) {
        this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.svgImage = svgImage;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        svgImage.appendChild(this.rect);
    }

    set x(x: number) {
        this.rect.setAttribute("x", `${x}`);
    }

    get x(): number {
        return(parseInt(this.rect.getAttribute("x") as string, 10));
    }

    set y(y: number) {
        this.rect.setAttribute("y", `${y}`);
    }

    get y(): number {
        return(parseInt(this.rect.getAttribute("y") as string, 10));
    }

    set width(width: number) {
        this.rect.setAttribute("width", `${width}`);
    }

    get width(): number {
        return(parseInt(this.rect.getAttribute("width") as string, 10));
    }

    set height(height: number) {
        this.rect.setAttribute("height", `${height}`);
    }

    get height(): number {
        return(parseInt(this.rect.getAttribute("height") as string, 10));
    }
}