const highlight = require('./highlight')
const languages = require('./prism-languages')
const marked = require('marked')

const DEFAULT_LANGUAGE = 'javascript'
const MAP_LANGUAGES = {
  py: 'python',
  js: 'javascript',
  json: 'javascript',
  rb: 'ruby',
  html: 'markup'
}

export function getHighlightLangForTopic (topic, lang) {
  // Normalize language id
  let language = lang || topic && topic.language || DEFAULT_LANGUAGE
  language = language.toLowerCase()
  language = MAP_LANGUAGES[language] || language
  if (!languages[language]) {
    language = DEFAULT_LANGUAGE
  }
  return languages[language]
}

export function getHighlightFromTopic (topic) {
  return (code, lang) => {
    let codeWidth = 0
    code.split('\n').forEach((line) => {
      codeWidth = Math.max(codeWidth, line.length)
    })
    let widthClass = 'width-44-cols'
    if (codeWidth <= 29) {
      widthClass = 'width-29-cols'
    } else if (codeWidth <= 34) {
      widthClass = 'width-34-cols'
    } else if (codeWidth <= 39) {
      widthClass = 'width-39-cols'
    }
    const language = getHighlightLangForTopic(topic, lang)
    let html = '<div class="' + widthClass + '">'
    try {
      html += highlight(code, language)
    } catch (e) {
      html += code
    }
    html += '</div>'
    return html
  }
}

export function uniqueArrayByField (array, field) {
  const u = {}
  const a = []
  for (let i = 0, l = array.length; i < l; ++i) {
    if (u.hasOwnProperty(array[i][field])) {
      continue
    }
    a.push(array[i])
    u[array[i][field]] = 1
  }
  return a
}

export function parseInsightMarkdown (insight = {}) {
  const highlightFromTopic = getHighlightFromTopic(insight.topic)
  const renderer = new marked.Renderer()
  renderer.link = (href, title, text) =>
                        '<span class="md-link">' + text + '</span>'
  renderer.image = (href/* , title, text */) => decodeURI(href)
  return {
    headline: marked(insight.headline || '', {
      renderer,
      tables: false,
      sanitize: true,
      highlight: highlightFromTopic
    }),
    content: marked(insight.content || '', {
      renderer,
      sanitize: true,
      highlight: highlightFromTopic
    })
  }
}
