const { RegexButWithWords } = require("regex-but-with-words");
const regexButWithWords = require("regex-but-with-words/lib/expressions");

module.exports = {
  ansiBold: "\u001b[1m",
  ansiResetDim: "\u001b[22m",
  ansiRed: "\u001b[31m",
  ansiBlue: "\u001b[34m",
  ansiCyan: "\u001b[36m",
  ansiLtGray: "\u001b[37m",
  ansiDefaultForeground: "\u001b[39m",
  unescapedQuotesRegex: new RegexButWithWords().literal('"').done("g"),
  indexNameRegExp: new RegexButWithWords()
    .group((exp) => {
      exp.literal("_").or().literal("-");
    })
    .done("g"),
  resourceAddressRegExp: new RegexButWithWords()
    .any()
    .oneOrMore()
    .literal(".")
    .look.ahead((exp) => {
      exp.any().oneOrMore().literal(".").any().oneOrMore();
    })
    .done("g"),
  replaceDashes: new RegexButWithWords().literal('"-"').done("g"),
  replaceUnescapedQuotationMarks: new RegexButWithWords()
    .literal(":")
    .whitespace()
    .lazy()
    .literal('"')
    .done("g"),
  replaceDashBackslash: new RegexButWithWords()
    .literal("-")
    .whitespace()
    .lazy()
    .literal('"')
    .done("g"),
  replaceQuotesNewLine: new RegexButWithWords()
    .literal('"')
    .look.ahead((exp) => {
      exp.newline();
    })
    .done("g"),
  replaceSlashQuotationMark: new RegexButWithWords()
    .backslash()
    .look.ahead((exp) => {
      exp.literal('"');
    })
    .done("g"),
  replacesAtSymbol: new RegexButWithWords().literal("@@@").done("g"),
  replacesPercentageMarks: new RegexButWithWords().literal("%%%%%").done("g"),
  notEscapedQuotationMarks: new RegexButWithWords().literal('"').done("g"),
  tfxModuleRegExp: new RegexButWithWords()
    .literal("tfx.module(")
    .whitespace()
    .oneOrMore()
    .literal('"')
    .any()
    .oneOrMore()
    .literal('",')
    .whitespace()
    .oneOrMore()
    .literal("'")
    .any()
    .oneOrMore()
    .literal("',")
    .whitespace()
    .oneOrMore()
    .literal("{}")
    .whitespace()
    .oneOrMore()
    .literal(");")
    .done("g"),
  extraWhitespaceRegExp: new RegexButWithWords()
    .newline()
    .whitespace()
    .anyNumber()
    .newline()
    .oneOrMore()
    .done("g"),
  newLineBeforeNextBlockRegExp: new RegexButWithWords()
    .literal(";")
    .newline()
    .look.ahead((exp) => {
      exp.literal("tfx");
    })
    .done("g"),
  quotesAroundStringsAndEscapedSlashes: new RegexButWithWords().look
    .behind((exp) => {
      exp.whitespace();
    })
    .literal('"')
    .look.ahead((exp) => {
      exp.word();
    })
    .or()
    .look.behind((exp) => {
      exp.word().or().digit().or().literal("]");
    })
    .literal('"')
    .look.ahead((exp) => {
      exp.newline();
    })
    .or()
    .group((exp) => {
      exp.literal("\\", 4);
    })
    .or()
    .look.behind((exp) => exp.literal("-").whitespace())
    .literal('"')
    .done("g"),
  escapedQuotesRegExp: new RegexButWithWords().literal('\\\\\\"').done("g"),
  spacesBeforeOpenBraces: new RegexButWithWords()
    .whitespace()
    .whitespace()
    .look.ahead((exp) => {
      exp.literal("{");
    })
    .done("i"),
  extraNewlinesRegExp: new RegexButWithWords()
    .newline()
    .whitespace()
    .anyNumber()
    .newline()
    .oneOrMore()
    .done("g"),
  endingNewlinesRegExp: new RegexButWithWords()
    .literal(";")
    .newline()
    .look.ahead((exp) => {
      exp.literal("tfx");
    })
    .done("g"),
  inOutExp: new RegexButWithWords()
    .whitespace()
    .literal("-out=tfplan")
    .whitespace()
    .literal("-input=false")
    .done("gs"),
  fileNameRegExp: new RegexButWithWords()
    .whitespace()
    .look.ahead((exp) => {
      exp.notWhitespace().oneOrMore().literal(".tf");
    })
    .done("g"),
};
