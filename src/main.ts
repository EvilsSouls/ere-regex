import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("a(bb)+a");
console.log(testRegex.builtRegex);
document.getElementById("page-container")?.appendChild(testRegex.builtRegex.visualizeNFA());

debugger;