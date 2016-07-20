const {highlight} = require('prismjs')
const languages = require('./prism-languages')
const marked = require('marked')

export function isItTheSameDay (date) {
  return new Date(date).getDate() === (new Date().getDate())
}

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

function styleFootnotesInContent (insightId, parsedContent) {
  let newParsedContent = parsedContent
  let modified = true
  while (modified) {
    modified = false
    const regexp1 = /\[(\d+)\]/
    if (regexp1.test(newParsedContent)) {
      const num = regexp1.exec(newParsedContent)[1]
      newParsedContent = newParsedContent.replace(regexp1, `
       <span class='footnote-clickable-area'
             id='${insightId}_footnote_${num}'>
          <span class='footnote-number in-text'>${num}</span>
        </span>
      `)
      modified = true
    }
    const regexp2 = /<span\s+class="([\w\s]*)"\s+>(\w*)__(\d+)<\/span>/
    const regexp3 = /(\w*)__(\d+)/
    if (regexp2.test(newParsedContent)) {
      const [match, className, name, num] = regexp2.exec(newParsedContent)
      newParsedContent = newParsedContent.replace(match,
        `<span class="${className + ' underlined-code-token'}"
         id='${insightId}_footnote_${num}'>${name}` +
         `<span class='footnote-number in-code'>${num}</span></span>`)
      modified = true
    } else if (regexp3.test(newParsedContent)) {
      const [match, name, num] = regexp3.exec(newParsedContent)
      const content = (name === 'DOTDOTDOT')
        ? '<span class="dotdotdot">●●●</span>' : name
      newParsedContent = newParsedContent.replace(match,
        `<span class="token underlined-code-token"
         id='${insightId}_footnote_${num}'>${content}` +
         `<span class='footnote-number in-code'>${num}</span></span>`)
      modified = true
    }
  }
  return newParsedContent
}

function styleFootnotesWithTypes (insightId, parsedContent) {
  let newParsedContent = parsedContent
  for (let i = 0; i < 1000; i++) {
    const regexp = /\[(\d+):(.+)\]/
    if (regexp.test(newParsedContent)) {
      const num = regexp.exec(newParsedContent)[1]
      const footnoteType = regexp.exec(newParsedContent)[2]
      newParsedContent = newParsedContent.replace(regexp, `
       <span class='footnote-title'
        id='${insightId}_footnoteTitle_${num}'>
         <span class='footnote-title-num'>${num}</span>
         <span class='footnote-title-type'>${footnoteType}</span>
       </span>
      `)
    } else {
      break
    }
  }
  return newParsedContent
}

function footnotesPopUps (footnotes, highlightFromTopic, renderer) {
  if (!footnotes) {
    return {}
  }
  const lines = footnotes.split('\n')
  const blocks = {}
  let num = null
  lines.forEach(line => {
    const regexp = /\[(\d+):(.+)\]/
    if (regexp.test(line)) {
      num = regexp.exec(line)[1]
      blocks[num] = {
        num,
        title: regexp.exec(line)[2],
        lines: []
      }
    } else if (num) {
      blocks[num].lines.push(line)
    }
  })
  Object.keys(blocks).forEach(k => {
    blocks[k].content = marked(blocks[k].lines.join('\n'), {
      renderer,
      sanitize: true,
      highlight: highlightFromTopic
    })
    delete blocks[k].lines
  })
  return blocks
}

export function parseInsightMarkdown (insight = {}) {
  const highlightFromTopic = getHighlightFromTopic(insight.topic)
  const insightId = insight.id || insight._id
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
    content: styleFootnotesInContent(insightId,
      marked(insight.content || '', {
        renderer,
        sanitize: true,
        highlight: highlightFromTopic
      })),
    footnotesPreview: styleFootnotesWithTypes(insightId,
      marked(insight.footnotes || '', {
        renderer,
        sanitize: true,
        highlight: highlightFromTopic
      })),
    footnotesPopUps: footnotesPopUps(insight.footnotes,
      highlightFromTopic, renderer)
  }
}
