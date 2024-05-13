/**
 * @summary A Map of all accepted chars in a regex and what kind of character it is. 0 = literal character, 1 = metacharacter, 2<priority> = operator (& metacharacter)
 */
const acceptedChars: Map<string, string> = new Map([
[" ", "0"],
["!", "0"],
['"', "0"],
["#", "0"],
["$", "0"],
["%", "0"],
["&", "0"],
["'", "0"],
["(", "1"],
[")", "1"],
["*", "23"],
["+", "23"],
[",", "0"],
["-", "0"],
[".", "1"],
["/", "0"],
["0", "0"],
["1", "0"],
["2", "0"],
["3", "0"],
["4", "0"],
["5", "0"],
["6", "0"],
["7", "0"],
["8", "0"],
["9", "0"],
[":", "0"],
[";", "0"],
["<", "0"],
["=", "0"],
[">", "0"],
["?", "23"],
["@", "0"],
["A", "0"],
["B", "0"],
["C", "0"],
["D", "0"],
["E", "0"],
["F", "0"],
["G", "0"],
["H", "0"],
["I", "0"],
["J", "0"],
["K", "0"],
["L", "0"],
["M", "0"],
["N", "0"],
["O", "0"],
["P", "0"],
["Q", "0"],
["R", "0"],
["S", "0"],
["T", "0"],
["U", "0"],
["V", "0"],
["W", "0"],
["X", "0"],
["Y", "0"],
["Z", "0"],
["[", "1"],
["\\", "1"],
["]", "1"],
["^", "0"],
["_", "0"],
["`", "0"],
["a", "0"],
["b", "0"],
["c", "0"],
["d", "0"],
["e", "0"],
["f", "0"],
["g", "0"],
["h", "0"],
["i", "0"],
["j", "0"],
["k", "0"],
["l", "0"],
["m", "0"],
["n", "0"],
["o", "0"],
["p", "0"],
["q", "0"],
["r", "0"],
["s", "0"],
["t", "0"],
["u", "0"],
["v", "0"],
["w", "0"],
["x", "0"],
["y", "0"],
["z", "0"],
["{", "1"],
["|", "20"],
["}", "1"],
["~", "0"],
["°", "21"],
]);

interface OperatorStackElement {
    priority: number;
    char: string;
}

function convertRegexExpressionToPostfix(regex: string): string {
    const insideBrackets = 0;
    const resultQueue: string[] = [];
    const operatorStack: OperatorStackElement[] = [];

    for(let i = 0; i < regex.length; i++) {
        const currentChar = regex.at(i) as string;
        switch(acceptedChars.get(currentChar)?.at(0)) {
            case "0":
                resultQueue.push(currentChar);
                break;
            case "1":
                console.log("Not done!");
                break;
            case "2":
                const priority = Number(acceptedChars.get(currentChar)?.at(1)) + insideBrackets * 10;
                const topStackPriority = operatorStack[operatorStack.length - 1];
                break;
            default:
                console.error(`Invalid character at position ${i}`)
        }
    }

    return("");
}

export default function matchRegex(string: string, regex: string): string[] {
    return([]);
}