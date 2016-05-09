import Handlebars from 'handlebars'

export default function render (insight) {
  const source = document.getElementById('insight-template').innerHTML
  const template = Handlebars.compile(source)
  const html = template(insight)

  const container = document.getElementById('enki-insights')
  container.style.background = (insight.topic || {}).color

  container.innerHTML = html
}
