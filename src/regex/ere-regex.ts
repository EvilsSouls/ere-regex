import State from "./state";
import NFA from "./nfa";

const operators = ["|", "°", "*", "+", "?", "{"] as const;
type Operator = (typeof operators)[number];
type TokenType = "default" | "escape-next" | "character-set" | "interval-expression";

/**
 * @todo Add method for visualizing RegEx. This would use the NFA.visualizeNFA method probably and add some extra stuff (like the leading arrow, I'm not really sure)
 */
export default class ERERegex {
    readonly regex: string;
    readonly builtRegex: NFA;
    
    constructor(regex: string) {
        this.regex = regex;
        this.builtRegex = this.buildNFA(this.convertToPostfix(this.tokenize(this.regex)));
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

                // Checks whether or not there's implicit concatenation and if so add it between the two tokens
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
     * @description Builds an NFA from a postfix & tokenized Regular Expression. To learn more about this process (and what an NFA is) read this article: https://swtch.com/~rsc/regexp/regexp1.html
     * @param tokens The tokens to build the NFA from. Needs to be in RPN (Reverse Polish Notation aka Postfix Notation) and tokenized.
     * @param patchMatchingState Whether or not to patch in the Matching State in the end. (This is useful, if you still want a fragment in the end. For example if you are using this function to expand an expression which is just syntactic sugar (for example Interval Expressions))
     * @returns A fully built NFA.
     */
    buildNFA(tokens: string[], patchMatchingState: boolean = true): NFA {
        const fragmentStack: NFA[] = [];
        
        for(let i = 0; i < tokens.length; i++) {
            const currentToken = tokens[i];
            const identifyingChar = currentToken[0];
            switch(identifyingChar) {
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

                    if(!nfaFragment) {throw new Error("Kleene Star expects a fragment on stack, yet there are none.");}

                    // Makes all Floating Arrows point to the State before this fragment (which will be the Branching State)
                    nfaFragment.patchAllStates(-1);

                    const newFragment = new NFA();
                    newFragment.addBranches(nfaFragment);
                    // Adds a Floating Arrow connection from the Branching State to finish the Fragment Schema
                    newFragment[0].addConnection(undefined);
                    
                    fragmentStack.push(newFragment);
                    break;
                }
                case "+": {
                    const nfaFragment = fragmentStack.pop()

                    if(!nfaFragment) {throw new Error("Plus Quantifier expects a fragment on stack, yet there are none.");}

                    const newState = new State();
                    newState.addConnection(-nfaFragment.length);
                    newState.addConnection(undefined);

                    nfaFragment.joinNFAs(new NFA(newState));
                    
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
                case "{": {
                    const nfaFragment = fragmentStack.pop();
                    if(!nfaFragment) {throw new Error("Interval Expression expects a fragment on stack, yet there are none.");}

                    let minimum: number | null = null, maximum: number | null = null;

                    // Extracts the minimum and maximum values out of the Interval Expression
                    for(let i = 1, mode: "minimum" | "maximum" | "outside" = "minimum", currentTempNum = ""; mode !== "outside"; i++) { // mode is what number the for loop is currently looking at. The lower bound is the minimum, the upper bound is the maximum, and "outside" means it's outside the curly braces
                        if(i >= currentToken.length) {throw new Error("Interval Expression did not have closing curly bracket.");}
                        
                        if(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(currentToken[i])) {currentTempNum += currentToken[i]; continue;}
                        if(currentToken[i] === ",") {
                            if(mode === "maximum") {throw new Error("Interval Expression can only have one comma.");}
                            
                            // Only changes the minimum if there is already a number. This is to stop parseInt() evaluating to NaN. (If the interval expression would match {,max})
                            if(currentTempNum !== "") {
                                minimum = parseInt(currentTempNum, 10);
                                currentTempNum = "";
                            }
                            mode = "maximum";
                            continue;
                        }
                        if(currentToken[i] === "}") {
                            if(!minimum && !maximum && !currentTempNum) {throw new Error("Found Empty Interval Expression!");}
                            
                            // Only changes the maximum if there is already a number. This is to stop parseInt() evaluating to NaN. (If the interval expression would match {min,})
                            if(currentTempNum !== "") {maximum = parseInt(currentTempNum, 10)};

                            // Checks whether the interval expression matches {n}. If so it sets the minimum to the same as the maximum will be to make the expression do an exact search.
                            if(!minimum && !maximum && currentTempNum) {minimum = parseInt(currentTempNum, 10);}
                            
                            mode = "outside";
                            continue;
                        }

                        throw new Error("Unhandled Character in Interval Expression.");
                    }

                    console.log("Minimum:", minimum);
                    console.log("Maximum:", maximum);

                    const newFragment = new NFA();

                    if(minimum) {for(let i = 0; i < minimum; i++) {
                        newFragment.joinNFAs(nfaFragment);
                    }}

                    // Handles case {min,}
                    if(!maximum) {
                        const kleeneStarFragment = nfaFragment;
                        // This is just the same code as for the Kleene Star operator.
                        kleeneStarFragment.patchAllStates(-1);
                        
                        const addendFragment = new NFA()
                        addendFragment.addBranches(kleeneStarFragment);
                        addendFragment[0].addConnection(undefined);

                        newFragment.joinNFAs(addendFragment);
                    } else { // Handles case {,max} or {min,max}
                        const difference = maximum - (minimum ? minimum : 0);
                        // This is just the same code as for the question mark operator.
                        const addendFragment = new NFA();
                        addendFragment.addBranches(nfaFragment);
                        addendFragment[0].addConnection(undefined);

                        // Joins the optional characters to the necessary ones.
                        for(let i = 0; i < difference; i++) {
                            newFragment.joinNFAs(addendFragment);
                        }
                    }

                    fragmentStack.push(newFragment);
                    break;
                }
                default: {
                    // Removes the backslash, if it exists.
                    let modifiedCurrentToken = currentToken;
                    if(currentToken.at(0) === "\\") {modifiedCurrentToken = modifiedCurrentToken.slice(1);}
                    
                    const state = new State()
                    state.addConnection(undefined, modifiedCurrentToken);
                    const newFragment = new NFA(state);
                    fragmentStack.push(newFragment);
                }
            }
        }

        if(fragmentStack.length !== 1) {throw new Error("Fragment Stack has not been concatenated fully. This is usually because of a bad regex.")}

        const nfa = fragmentStack[0];
        if(patchMatchingState) {nfa.patchAllStates(null);}
        return(nfa);
    }

    matchText(text: string): boolean {
        throw new Error("Not implemented yet!");
    }
}