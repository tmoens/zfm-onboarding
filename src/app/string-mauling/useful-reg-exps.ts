// a regular expression for extracting whole transgenes like Tg(-7.3gata2a:GFP) as a single token
export const tgRegExp: RegExp = new RegExp(/(tg\s?\([^)]*\))/, 'gi');
// a regular expression to capture everything between parens as an expression
export const parenRegExp: RegExp = new RegExp(/(\([^)]*\))/, 'gi');
export const doubleWhiteSPaceRegExp: RegExp = new RegExp(/\s{2,}/, 'gi')
