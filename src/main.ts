import ERERegex from "./regex/ere-regex.js";

const testRegex = new ERERegex("(colou?r)*");
//const testRegex = new ERERegex("\(")
const testString = "colourcolorcolourcolourabcolorcolourcolor";

const match = testRegex.matchText(testString);

console.log(match.hasMatched ? `Has matched. Final match: ${testString.substring(0, match.end as number + 1)}` : "Has not matched");