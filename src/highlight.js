let chunks;

// prism highlight and languages
const {highlight} = require('prismjs');
const languages = require('./prism-languages');

// HTML escaper
const html = {
  chars: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  },
  escape: content => content.replace(html.find, html.replace),
  find: /[&<>'"]/g,
  replace: $0 => html.chars[$0],
};

// unique identifier for RegExp replacements
// kept as number to avoid possible <span> elements
// between the uid and the chunks index
const uid = (Math.random() + '').slice(2);
// every potentially wrapped by span
// within strings or regexps, will be parsed
// and the decimal point will be the chunks index
const uidFinder = new RegExp(
  '(?:<[^>]+?>)?' +
    uid + '\\.(\\d+)' +
  '(?:<\\/[^>]+?>)?', 'g'
);

// gives back original chunks content
const uidReplacer = ($0, $1) => html.escape(chunks[$1]);

// common RegExp to find single or double quoted strings
const commonStringRegExp =
  /(["'])(?:(?=(\\?))\2.)*?\1/g;

// common replacer used by languageWrap
// returns, as example, the following:
//  "132019319230.2"
//  /786318276s18.3/
const commonReplacer = ($0, $1) => {
  const len = $1.length;
  return $1 + uid + '.' + (
    chunks.push($0.slice(len, -len)) - 1
  ) + $1;
};

// each langauge has a find/replace list
// right now they are all almost the same
// but there could be edge cases, like in JS
const languageWrap = {
  javascript: {
    find: [
      commonStringRegExp,
      /(\/)[^/*](?:(?=(\\?))\2.)*\1([^/=*]|$)/g,
    ],
    replace: [
      commonReplacer,
      ($0, $1, $2, $3) => {
        const len = $1.length;
        return $1 + uid + '.' + (
          chunks.push(
            $0.slice(len, -(len + $3.length))
          ) - 1
        ) + $1 + $3;
      },
    ],
  },
  python: {
    find: [
      commonStringRegExp,
    ],
    replace: [
      commonReplacer,
    ],
  },
  ruby: {
    find: [
      commonStringRegExp,
    ],
    replace: [
      commonReplacer,
    ],
  },
};

// some language has a shortcut equivalent.
languageWrap.js = languageWrap.javascript;
languageWrap.py = languageWrap.python;

// map each available Prism language name
// by its object reference
const langMap = new Map(
  Object.keys(languages).map(key => [
    languages[key], key,
  ])
);

// loop over all find/replace array entries
function loopReplace(content, replacer) {
  let out = content;
  for (let i = 0, find = replacer.find; i < find.length; i ++) {
    out = out.replace(find[i], replacer.replace[i]);
  }
  return out;
}

// return a safely highlghted piece of code
// if the language is available in languageWrap
// it just use prism highlight otherwise
module.exports = function saferHighlight(content, language) {
  chunks = [];
  const languageName = langMap.get(language) || '';
  const wrap = languageWrap.hasOwnProperty(languageName) ?
    languageWrap[languageName] : null;
  let out = content;
  if (wrap) out = loopReplace(out, wrap);
  out = highlight(out, language);
  if (wrap) {
    // accordingly with the amount of possible replacements
    // put back N times original content.
    // As example, if a string was removed from a regexp
    // put it back after the RegExp is also back
    let i = wrap.find.length;
    while (i--) out = out.replace(uidFinder, uidReplacer);
  }
  chunks = [];
  return out;
};
