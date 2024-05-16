import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("abc");

console.log(testRegex.convertToPostfix());