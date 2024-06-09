import {insertString} from "../generic_functions.js"

const operators = ["|", "°", "*", "+", "?", "{"] as const;
type Operator = (typeof operators)[number];
type TokenType = "default" | "escape-next" | "character-set" | "interval-expression";

interface State {
    
}

export default class ERERegex {
    readonly regex: string;
    
    constructor(regex: string) {
        this.regex = regex;
    }

    isOperator(string: any): string is Operator {
        return operators.includes(string as Operator);
    }

    tokenize(): string[] {
        const tokens: string[] = [];
        let currentTempToken = "";
        let currentMode: TokenType = "default";
        let allowedCharacters: string[] = []; // Empty Array means all characters are allowed.

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

                case currentChar === "°" && currentMode !== "escape-next" && currentMode !== "character-set":
                    currentTempToken += "\\"; // This automatically escapes any °s encountered, since for the end-user ° should not be a metacharacter.
                    break;

                case currentChar === "[" && currentMode !== "escape-next" && currentMode !== "character-set":
                    currentMode = "character-set";
                    currentTempToken += currentChar;
                    continue;
                
                case currentChar === "{" && currentMode !== "escape-next" && currentMode !== "character-set":
                    currentMode = "interval-expression";
                    allowedCharacters = ["}", ",", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
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
                    allowedCharacters = [];

                case this.isOperator(currentChar) && currentMode !== "escape-next" && currentMode !== "character-set":
                    currentTempToken += currentChar;
                    tokens.push(currentTempToken);
                    currentTempToken = "";
                    continue;

                case currentChar === ")" && currentMode !== "escape-next" && currentMode !== "character-set":
                    const newNAtom = atomAmountsStack.pop();
                    if(newNAtom === undefined) {throw new Error(`Unexpected closing bracket at ${i}. Did you forget to add the opening bracket or escape the closing one?`);}
                    nAtom = newNAtom + 1;

                    currentTempToken += currentChar;

                    if(nAtom > 1) {
                        // If implicit concatenation is needed, will add that concatenation before the last open bracket (That isn't escaped).
                        for(let i = -1; i >= -tokens.length; i--) {
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
            }
            
            currentTempToken += currentChar;

            if(currentMode === "escape-next") {
                currentMode = "default";
            }

            if(currentMode === "default") {
                nAtom++;

                // Check whether or not there's implicit concatenation and if so add it between the two tokens
                if(nAtom > 1) {
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

    convertToPostfix(tokens: string[]): string[] {
        const result: string[] = [];

        const operatorStack: (Operator | "(")[] = [];
        const operatorPriorities: Map<Operator, number> = new Map([["|", 0], ["°", 1], ["*", 2], ["+", 2], ["?", 2], ["{", 2]]);

        for(let i = 0; i < tokens.length; i++) {
            const currentToken = tokens[i];
            const identifyingChar = tokens[0];

            switch(true) {
                case identifyingChar === undefined:
                    throw new Error("Current Char is undefined. There is literally no case in the world where this happens...");

                case this.isOperator(identifyingChar):
                    const currentCharPriority = operatorPriorities.get(identifyingChar as Operator) as number;
                    let topOperator = operatorStack.at(-1);
                    let topOperatorPriority = operatorPriorities.get(topOperator as string[0] as Operator);

                    while(topOperator && topOperatorPriority && currentCharPriority <= topOperatorPriority) {
                        operatorStack.pop();
                        result.push(topOperator);

                        topOperator = operatorStack.at(-1);
                        topOperatorPriority = operatorPriorities.get(topOperator as string[0] as Operator);
                    }

                    operatorStack.push(currentToken as Operator);

                    // If the operator is one that determines how many times a token can be repeated, then it adds all the operators on the stack to the result, since the repeating operators are already in postfix
                    // Need to think about if adding THE ENTIRE QUEUE is actually necessary... maybe that isn't the right logic?
                    if(["*","+","?","{"].includes(identifyingChar)) {
                        for(let operator = operatorStack.pop(); operator !== undefined && operator !== "("; operator = operatorStack.pop()) {
                            result.push(operator);
                        }
                    }
                    break;

                case identifyingChar === "(":
                    operatorStack.push(currentToken as "(");
                    break;

                case identifyingChar === ")":
                    for(let operator = operatorStack.pop(); operator !== undefined && operator !== "("; operator = operatorStack.pop()) {
                        result.push(operator);
                    }
                    // Is this actually necessary?
                    operatorStack.pop();
                    break;

                default:
                    result.push(currentToken);
            }
        }

        // Need to check if this for loop actually works
        for(let operator = operatorStack.pop(); operator !== undefined && operator !== "("; operator = operatorStack.pop()) {
            result.push(operator);
        }

        return(result);
    }
}