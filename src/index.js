import renderInsight from './renderInsight'
import { config } from './config.js'

let enkiData = null

chrome.storage.local.get('enkiNewTab', (data) => {
  if (data && data.enkiNewTab && isItTheSameDay(data.enkiNewTab.expiry)) {
    enkiData = data.enkiNewTab
  }

  if (enkiData && enkiData.insight) {
    return renderInsight(enkiData.insight)
  }

  let headers = {
    'x-access-token': config.accessToken
  }

  fetch(config.endpoint, { headers })
    .then((response) => {
      if (response.ok) {
        return response.json().then((insights) => {
          console.log(insights)
          enkiData = {
            insight: insights.items[0],
            expiry: Date.now()
          }

          chrome.storage.local.set({ enkiNewTab: enkiData })
          renderInsight(insights.items[0])
        })
      }

      // TODO: error handling
    })
})

function isItTheSameDay (date) {
  return new Date(date).getDate() === (new Date().getDate())
}
