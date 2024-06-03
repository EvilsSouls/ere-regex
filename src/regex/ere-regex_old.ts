import {insertString} from "../generic_functions.js"

const operators = ["|", "°", "*", "+", "?"] as const;
type Operator = (typeof operators)[number];

interface OperatorStackElement {
    char: Operator;
    priority: number;
}

interface State {
    
}

export default class ERERegex {
    readonly regex: string;
    
    constructor(regex: string) {
        this.regex = regex;
    }

    isOperator(string: string): string is Operator {
        return operators.includes(string as Operator);
    }

    tokenize(): string[] {
        // VERY IMPORTANT REMINDER: Think about whether or not "atomAmountsStack" and "previousOperatorStacks" is needed in this function. And just generally
        // think about if this actually works, because I'm not sure. Also just finish it in general (with support for normal braces)
        
        const tokens: string[] = [];
        let currentTempToken = "";
        let appendCurrentToken = true;

        let nAtom = 0;
        const atomAmountsStack: number[] = [];

        for(let i = 0; i < this.regex.length; i++) {
            const currentChar = this.regex.at(i);
            switch(currentChar) {
                case undefined:
                    throw new Error("Current Char is undefined. There is literally no case in the world where this happens...");
                case "[":
                case "{":
                    if(appendCurrentToken) {
                        appendCurrentToken = false;
                    } else {
                        // REMINDER: If curly / square brackets ARE encountered treat them as REGULAR characters!!
                        throw new Error("Nested Curly / Square Brackets are not supported. Did you forget to escape them?");
                    }

                    currentTempToken += currentChar;
                    break;
                case "]":
                case "}":
                    if(!appendCurrentToken) {
                        appendCurrentToken = true;
                    } else {
                        throw new Error("No opening Curly / Square Bracket provided. Did you forget to escape the closing bracket?");
                    }
                default:
                    currentTempToken += currentChar;
                    
                    if(appendCurrentToken) {
                        if(currentChar === "(") {
                            atomAmountsStack.push(nAtom);
                            nAtom = 0;
                        } else if(this.isOperator(currentChar)) {
                            
                        } else {
                            if(currentChar === ")") {
                                const newNAtom = atomAmountsStack.pop();
                                if(!newNAtom) {throw new Error("Unexpected closing Bracket. Did you forget to escape it?");}
                                nAtom = newNAtom;
                            }

                            nAtom++;
                        }

                        if(nAtom > 1) {
                            tokens.push("°");
                            nAtom--;
                        }

                        tokens.push(currentTempToken);
                        currentTempToken = "";
                    }
            }
        }

        if(atomAmountsStack.length !== 0) {throw new Error(`Incorrect amount of opening and/or closing brackets. Amount of missing brackets = ${atomAmountsStack.length}`);}
        return(tokens);
    }

    convertToPostfix(): string[] {
        let regex = this.regex;
        const tokens: string[] = []; // Character Classes and Interval Expressions (Curly Braces) will take up one Element. Everything else should be just one character.

        let operatorStack: OperatorStackElement[] = [];
        const operatorPriorities: Map<Operator,number> = new Map([["|", 0], ["°", 1], ["*", 2], ["+", 2], ["?", 2]]);

        const atomAmountsStack: number[] = [];
        const previousOperatorStacks: OperatorStackElement[][] = [];
        
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