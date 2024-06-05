import {insertString} from "../generic_functions.js"

const operators = ["|", "°", "*", "+", "?"] as const;
type Operator = (typeof operators)[number];
type TokenType = "default" | "escape-next" | "character-set" | "interval-expression";

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
        let currentMode: TokenType = "default";
        // Empty Array means all characters are allowed.
        let allowedCharacters: string[] = [];

        let nAtom = 0;
        const atomAmountsStack: number[] = [];

        for(let i = 0; i < this.regex.length; i++) {
            const currentChar = this.regex.at(i);
            switch(true) {
                case currentChar === undefined:
                    throw new Error("Current Char is undefined. There is literally no case in the world where this happens...");
                
                case !allowedCharacters.includes(currentChar as string) && allowedCharacters.length > 0:
                    throw new Error(`Character at ${i} of RegEx cannot be included. This is usually because letters are being used in a Interval Expression.`);
                
                case currentChar === "\\" && currentMode !== "escape-next":
                    currentMode = "escape-next";
                    currentTempToken += currentChar;
                    continue;
                
                case currentChar === "[" && currentMode !== "escape-next" && currentMode !== "character-set":
                    currentMode = "character-set";
                    currentTempToken += currentChar;
                    continue;
                
                case currentChar === "{" && currentMode !== "escape-next" && currentMode !== "character-set":
                    currentMode = "interval-expression";
                    currentTempToken += currentChar;
                    continue;
                
                case currentChar === "(" && currentMode !== "escape-next" && currentMode !== "character-set":
                    currentTempToken += currentChar;
                    
                    atomAmountsStack.push(nAtom);
                    nAtom = 0;
                    
                    tokens.push(currentTempToken);
                    currentTempToken = "";
                    continue;
                
                case currentChar === "]" && currentMode !== "escape-next":
                    if(currentMode !== "character-set") {throw new Error(`Unexpected closing square bracket at ${i}. Did you forget to add the opening bracket or escape the closing one?`);}
                    currentMode = "default";
                    break;

                case currentChar === "}" && currentMode !== "escape-next" && currentMode !== "character-set":
                    if(currentMode !== "interval-expression") {throw new Error(`Unexpected closing curly bracket at ${i}. Did you forget to add the opening bracket or escape the closing one?`);}
                    currentMode = "default";
                    break;

                case currentChar === ")" && currentMode !== "escape-next" && currentMode !== "character-set":
                    const newNAtom = atomAmountsStack.pop();
                    if(newNAtom === undefined) {throw new Error(`Unexpected closing bracket at ${i}. Did you forget to add the opening bracket or escape the closing one?`);}
                    nAtom = newNAtom + 1;

                    currentTempToken += currentChar;

                    if(nAtom > 1) {
                        // If implicit concatenation is needed, will add that concatenation before the last open bracket (That isn't escaped).
                        for(let i = -1; i > -tokens.length; i--) {
                            if(tokens.at(i) === "(") {
                                tokens.splice(i, 0, "°");
                                nAtom--;
                                break;
                            }
                        }
                    }
                    
                    tokens.push(currentTempToken);
                    currentTempToken = "";
                    continue;

                case currentChar === "°" && currentMode !== "escape-next" && currentMode !== "character-set":
                    // This automatically escapes any °s encountered, since for the end-user ° should not be a metacharacter.
                    currentTempToken += "\\";
            }
            
            currentTempToken += currentChar;

            if(currentMode === "escape-next") {
                currentMode = "default";
            }

            if(currentMode === "default") {
                nAtom++;

                // Check whether or not there's implicit concatenation and if so add it between the two tokens
                if(nAtom > 1) {
                    // Also maybe add a for loop so that it repeatedly checks whether there needs to be more concatenation? This might not be needed however.
                    tokens.push("°");
                    nAtom--;
                }

                tokens.push(currentTempToken);
                currentTempToken = "";
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