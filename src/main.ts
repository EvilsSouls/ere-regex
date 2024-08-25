import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("ab{5}c");
console.log(testRegex.builtRegex);
document.getElementById("page-container")?.appendChild(testRegex.builtRegex.visualizeNFA());