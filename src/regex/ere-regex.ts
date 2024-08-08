import State from "./state";
import NFA from "./nfa";

const operators = ["|", "°", "*", "+", "?", "{"] as const;
type Operator = (typeof operators)[number];
type TokenType = "default" | "escape-next" | "character-set" | "interval-expression";

export default class ERERegex {
    readonly regex: string;
    
    constructor(regex: string) {
        this.regex = regex;
    }

    isOperator(string: any): string is Operator {
        return operators.includes(string as Operator);
    }

    tokenize(regex: string): string[] {
        const tokens: string[] = [];
        let currentTempToken = "";
        let currentMode: TokenType = "default";
        let allowedCharacters: string[] = []; // Empty Array means all characters are allowed.

        let nAtom = 0;
        const atomAmountsStack: number[] = [];

        for(let i = 0; i < regex.length; i++) {
            const currentChar = regex.at(i);
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
                    if(currentChar === "|") {nAtom--;} // Decreases nAtom since alternation combines two tokens into one.
                
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
            const identifyingChar = currentToken[0];

            switch(identifyingChar) {
                case undefined:
                    throw new Error("Current Char is undefined. There is literally no case in the world where this happens...");

                case "°":
                case "|":
                    const currentCharPriority = operatorPriorities.get(identifyingChar) as number;
                    let topOperator = operatorStack.at(-1);
                    let topOperatorPriority = operatorPriorities.get(topOperator as Operator);

                    while(topOperator && topOperatorPriority && currentCharPriority <= topOperatorPriority) {
                        operatorStack.pop();
                        result.push(topOperator);

                        topOperator = operatorStack.at(-1);
                        topOperatorPriority = operatorPriorities.get(topOperator as Operator);
                    }

                    operatorStack.push(currentToken as Operator);
                    break;

                case "(":
                    operatorStack.push(currentToken as "(");
                    break;

                case ")":
                    for(let operator = operatorStack.pop(); operator !== undefined && operator !== "("; operator = operatorStack.pop()) {
                        result.push(operator);
                    }
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

    /**
     * @todo Maybe change the fragments from the type State[] to a specialized type called something like Fragment. This would have a getter / setter for easily modifying the latest state?
     * @todo For some reason the fragments are in reversed order?? doesn't make any sense
     */
    buildNFA(tokens: string[]): NFA {
        const fragmentStack: NFA[] = [];
        
        for(let i = 0; i < tokens.length; i++) {
            switch(tokens[i]) {
                case undefined: {
                    throw new Error("Current Char is undefined. There is literally no case in the world where this happens...");
                }
                case "|": {
                    const alternativeFragment2 = fragmentStack.pop();
                    const alternativeFragment1 = fragmentStack.pop();

                    if(!alternativeFragment1 || !alternativeFragment2) {throw new Error("Alternation Operator expects 2 fragments on stack, yet either one or both is undefined.");}

                    const newFragment = new NFA();
                    newFragment.addBranches(alternativeFragment1, alternativeFragment2);
                    fragmentStack.push(newFragment);
                    break;
                }
                case "°": {
                    const nfaFragment2 = fragmentStack.pop();
                    const nfaFragment1 = fragmentStack.pop();

                    if(!nfaFragment1 || !nfaFragment2) {throw new Error("Concatenation Operator expects 2 fragments on stack, yet either one or both is undefined.");}

                    nfaFragment1.joinNFAs(nfaFragment2);
                    fragmentStack.push(nfaFragment1);
                    break;
                }
                case "*": {
                    const nfaFragment = fragmentStack.pop();
                    const lastState = nfaFragment?.at(-1);

                    if(!nfaFragment || !lastState) {throw new Error("Kleene Star expects a fragment on stack, yet there are none.");}

                    lastState.addConnection(-nfaFragment.length); // Need to check whether or not this is the right amount (to return back to Branching State)
                    nfaFragment[nfaFragment.length - 1] = lastState;

                    const newFragment = new NFA();
                    newFragment.addBranches(nfaFragment);
                    // Adds a Floating Arrow connection from the Branching State to finish the Fragment Schema
                    newFragment[0].addConnection(undefined);
                    
                    fragmentStack.push(newFragment);
                    break;
                }
                case "+": {
                    const nfaFragment = fragmentStack.pop()
                    const lastState = nfaFragment?.at(-1);

                    if(!nfaFragment || !lastState) {throw new Error("Plus Quantifier expects a fragment on stack, yet there are none.");}

                    lastState.addConnection(-nfaFragment.length);
                    nfaFragment[nfaFragment.length - 1] = lastState;
                    
                    fragmentStack.push(nfaFragment);
                    break;
                }
                case "?": {
                    const nfaFragment = fragmentStack.pop()

                    if(!nfaFragment) {throw new Error("Question Mark Quantifier expects a fragment on stack, yet there are none.");}

                    const newFragment = new NFA();
                    newFragment.addBranches(nfaFragment);
                    // Adds a Floating Arrow connection from the Branching State to finish the Fragment Schema
                    newFragment[0].addConnection(undefined);

                    fragmentStack.push(newFragment);
                    break;
                }
                case "{": { // Still need to fix this not working, due to being longer than 1 character. Maybe change this to the thing with identifyingCharacter??
                    break;
                }
                default: {
                    const state = new State()
                    state.addConnection(undefined, tokens[i]);
                    const newFragment = new NFA(state);
                    fragmentStack.push(newFragment);
                }
            }
        }

        if(fragmentStack.length !== 1) {throw new Error("Fragment Stack has not been concatenated fully. This is usually because of a bad regex.")}

        const nfa = fragmentStack[0];
        return(nfa);
    }
}