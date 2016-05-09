import renderInsight from './renderInsight'

let enkiData = null

chrome.storage.local.get('enkiNewTab', (data) => {
  if (data && data.enkiNewTab && data.enkiNewTab.expiry > Date.now()) {
    enkiData = data.enkiNewTab
  }

  if (enkiData) {
    return renderInsights(enkiData.insights)
  }

  let headers = {
    'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1NTQzNzM1MDYxY2EyOWVhMDAzYTBjMjMiLCJleHAiOjE0OTQyNjMyMDA4MjZ9.XF9KaZaYjxbwZvLDF7-Sd-qTAou8hTIOqUGxVoKLaiE'
  }

  fetch('https://insights.enki.com/api/insights/live/0', { headers })
    .then((response) => {
      if (response.ok) {
        return response.json().then((insights) => {
          console.log(insights)
          enkiData = {
            insights,
            expiry: Date.now() + 86400000
          }

          chrome.storage.local.set({ enkiNewTab: enkiData })
          renderInsights(insights)
        })
      }

      // TODO: error handling
    })
})

function renderInsights (insights) {
  insights.items.map(insight => {
    renderInsight(insight)
  })
}
