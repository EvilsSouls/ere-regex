import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("a.*b");

console.log(testRegex.convertToPostfix(testRegex.tokenize(testRegex.regex)));

debugger;