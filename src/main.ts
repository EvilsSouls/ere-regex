import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("Well (hello|hi) World");

const nfa = testRegex.buildNFA(testRegex.convertToPostfix(testRegex.tokenize(testRegex.regex)));
console.log(nfa);
document.getElementById("page-container")?.appendChild(nfa.visualizeNFA());

debugger;