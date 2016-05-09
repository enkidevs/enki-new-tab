let enkiData = null

enkiData = chrome.storage.local.get('enkiNewTab', (data) => {
  console.log(data)
  if (data && data.enkiNewTab && data.enkiNewTab.expiry > Date.now()) {
    enkiData = data.enkiNewTab
  }

  if (!enkiData) {
    let headers = {
      'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1NTQzNzM1MDYxY2EyOWVhMDAzYTBjMjMiLCJleHAiOjE0OTQyNjMyMDA4MjZ9.XF9KaZaYjxbwZvLDF7-Sd-qTAou8hTIOqUGxVoKLaiE'
    }

    console.log('Calling API')

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
          })
        }
      })
  }
})
