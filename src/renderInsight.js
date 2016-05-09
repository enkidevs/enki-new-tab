import Handlebars from 'handlebars'

export function render (insight) {
  const source = document.getElementById('insight-template').innerHTML
  const template = Handlebars.compile(source)
  const html = template(insight)

  document.getElementById('enki-insights').innerHTML = html
}
