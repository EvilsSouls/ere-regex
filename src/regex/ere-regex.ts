import {insertString} from "../generic_functions.js"

type Operators = "|" | "°" | "*" | "+" | "?";

interface OperatorStackElement {
    char: Operators;
    priority: number;
}

export default class ERERegex {
    readonly regex: string;
    
    constructor(regex: string) {
        this.regex = regex;
    }

    convertToPostfix() {
        let regex = this.regex;
        const tokens: string[] = []; // Character Classes and Interval Expressions (Curly Braces) will take up one Element. Everything else should be just one character.

        const operatorStack: OperatorStackElement[] = [];
        const operatorPriorities: Map<Operators,number> = new Map([["|", 0], ["°", 1], ["*", 2], ["+", 2], ["?", 2]]);

        const atomAmountsStack = [];
        let nAtom = 0;
        let nInsideBrackets = 0;
        for(let i = 0; i < regex.length; i++) {
            const currentChar = regex.at(i);
            switch(currentChar) {
                case undefined:
                    throw new Error("Current Char is undefined. This means that the Program has majorly screwed up!!");
                case "*":
                case "+":
                case "?":
                case "|":
                case "°":
                    const basePriority = operatorPriorities.get(currentChar);
                    if(!basePriority) {throw new Error("Unknown Operator inside operator clause.");}

                    const operatorStackElement: OperatorStackElement = {char: currentChar, priority: basePriority + (nInsideBrackets * 10)};
                    
                    break;
                default:
                    tokens.push(currentChar);
                    nAtom++;

                    if(nAtom > 1) {
                        insertString(regex, "°", i);
                        nAtom--;
                    }
            }
        }
    }
}