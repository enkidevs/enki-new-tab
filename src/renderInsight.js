import Handlebars from 'handlebars'
import {parseInsightMarkdown} from './helpers'

export default function render (insight) {
  const source = document.getElementById('insight-template').innerHTML
  const template = Handlebars.compile(source)

  insight = {...insight, ...parseInsightMarkdown(insight)}

  const html = template(insight)

  document.getElementById('enki-container').style.background = (insight.topic || {}).color

  document.getElementById('enki-insights').innerHTML = html
}
