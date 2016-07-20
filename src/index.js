import renderInsight from './renderInsight'
import { isItTheSameDay } from './helpers'
import { config } from './config.js'

let enkiData = null

chrome.storage.local.get('enkiNewTab', (data) => {
  if (data && data.enkiNewTab && isItTheSameDay(data.enkiNewTab.expiry)) {
    enkiData = data.enkiNewTab
  }

  if (enkiData && enkiData.insight) {
    return renderInsight(enkiData.insight)
  }

  fetch(config.endpoint)
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
