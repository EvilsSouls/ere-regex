import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("b{,3}");
console.log(testRegex.builtRegex);
document.getElementById("page-container")?.appendChild(testRegex.builtRegex.visualizeNFA());