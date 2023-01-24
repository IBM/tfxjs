/**
 * Text replacement functions
 * Functions in this file handle text replacement, functions are stored here to increase
 * the readability of files like `extract.js`
 */

const { containsKeys } = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");
const {
  indexNameRegExp,
  resourceAddressRegExp,
  replaceDashes,
  replaceUnescapedQuotationMarks,
  replaceDashBackslash,
  replaceQuotesNewLine,
  replaceSlashQuotationMark,
  replacesPercentageMarks,
  replacesAtSymbol,
} = require("./constants");
const YAML = require("json-to-pretty-yaml");
const { capitalizeWords } = require("./helpers");

/**
 * resource name
 * @param {object} resource terraform resource
 * @param {string} resource.name Resource name
 * @param {number=} resource.index
 * @returns {string} composed name for resource
 */
function formatResourceName(resource) {
  let name = resource.name;
  if (containsKeys(resource, "index")) name += " " + resource.index;
  return capitalizeWords(name.replace(indexNameRegExp, " "));
}

/**
 * resource address
 * @param {object} resource terraform resource
 * @param {string} resource.mode will be data or resource
 * @param {string=} resource.address address
 * @param {string=} resource.name
 * @param {string=} resource.type
 * @param {Array<object>=} resource.instances
 * @returns {string} composed address for resource
 */
function formatResourceAddress(resource) {
  let resourceStr = resource.mode === "data" ? "data." : "";
  if (resource.address)
    resourceStr += resource.address.replace(resourceAddressRegExp, "");
  else
    resourceStr += `${resource.module ? `${resource.module}.` : ""}${
      resource.type
    }.${resource.name}`;
  if (resource.instances) {
    resourceStr = `${
      resource.instances.length > 1 ? "\n  " : ""
    }"${resourceStr}"`;
  }
  return resourceStr;
}

/**
 * Format module name
 * @param {str} address terraform address
 * @returns {string} Decorative module name
 */
function formatModuleName(address) {
  const moduleRegExp = new RegexButWithWords()
    .group((exp) => {
      exp.literal("module.");
    })
    .or()
    .group((exp) => {
      exp.literal('"]');
    })
    .done("g");
  const underscoreHyphenParenRegExp = new RegexButWithWords()
    .group((exp) => {
      exp.literal("_").or().literal("-").or().literal('["');
    })
    .done("g");
  const periodRegExp = new RegexButWithWords().literal(".").done("g");
  let deepestModule = address
    .split(".")
    [address.split(".").length - 1].replace(moduleRegExp, "") // Replace module. and "] with nothing
    .replace(underscoreHyphenParenRegExp, " ") // replace _ - and [" with space
    .replace(periodRegExp, " ");
  return capitalizeWords(deepestModule);
}

/**
 * format yaml output for module
 * @param {object} outputData output data as object
 * @returns {string} yaml data
 */
function formatModuleYamlOutput(outputData) {
  return (
    "\n" +
    YAML.stringify(outputData)
      .replace(replaceDashes, "@@@")
      .replace(replaceUnescapedQuotationMarks, "%%%%%") //replace unescaped quotation mark with 5 question marks to not use look.behind
      .replace(replacesPercentageMarks, ": ") //return colon and space
      .replace(replaceDashBackslash, "%%%%%")
      .replace(replacesPercentageMarks, "- ") //return dash and space
      .replace(replaceQuotesNewLine, "") //replace quotation marks followed by new line
      .replace(replaceSlashQuotationMark, "") //replace slashes followed by quotation mark
      .replace(replacesAtSymbol, '"-"')
  );
}

/**
 * add tab to beginning of string
 * @param {string} str
 * @param {number} tabs
 * @return {string} multiline string with indents
 */
function indent(str, tabs) {
  let tabCount = tabs || 0,
    splitStr = str.split("\n"),
    indentedLines = [];
  splitStr.forEach((line) => {
    for (let i = 0; i < tabCount; i++) {
      line = " " + line;
    }
    indentedLines.push(line);
  });
  return indentedLines.join("\n");
}

module.exports = {
  formatResourceName,
  formatResourceAddress,
  formatModuleName,
  formatModuleYamlOutput,
  indent,
};
