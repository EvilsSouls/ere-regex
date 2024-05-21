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

    convertToPostfix(): string[] {
        let regex = this.regex;
        const tokens: string[] = []; // Character Classes and Interval Expressions (Curly Braces) will take up one Element. Everything else should be just one character.

        let operatorStack: OperatorStackElement[] = [];
        const operatorPriorities: Map<Operators,number> = new Map([["|", 0], ["°", 1], ["*", 2], ["+", 2], ["?", 2]]);

        const atomAmountsStack: number[] = [];
        const previousOperatorStacks: OperatorStackElement[][] = []
        
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
                    const topOperatorStackElement = operatorStack.at(-1);

                    if(topOperatorStackElement && topOperatorStackElement.priority <= operatorStackElement.priority) {
                        operatorStack.pop();
                        tokens.push(topOperatorStackElement.char);
                    }
                    operatorStack.push(operatorStackElement);
                    
                    break;
                case "(":
                    nInsideBrackets++;

                    atomAmountsStack.push(nAtom);
                    nAtom = 0;

                    previousOperatorStacks.push(operatorStack);
                    operatorStack = [];
                    break;
                case ")":
                    nInsideBrackets--;
                    const newNAtom = atomAmountsStack.pop();
                    const newOperatorStack = previousOperatorStacks.pop();
                    
                    if(!newNAtom || !newOperatorStack) {throw new Error("Unexpected closing Bracket. Did you forget to escape it?");}

                    operatorStack.reverse().forEach((currentOperator) => {tokens.push(currentOperator.char);});
                    
                    nAtom = newNAtom + 1;
                    operatorStack = newOperatorStack;
                    break;
                default:
                    tokens.push(currentChar);
                    nAtom++;

                    if(nAtom > 1) {
                        regex = insertString(regex, "°", i + 1);
                        nAtom--;
                    }
            }
        }

        if(nInsideBrackets !== 0) {throw new Error(`Incorrect amount of opening and/or closing brackets. nInsideBrackets = ${nInsideBrackets}`);}

        operatorStack.reverse().forEach((currentOperator) => {tokens.push(currentOperator.char);});
        return(tokens);
    }
}