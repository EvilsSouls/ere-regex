import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("ab*c");
console.log(testRegex.builtRegex);
document.getElementById("page-container")?.appendChild(testRegex.builtRegex.visualizeNFA());

debugger;