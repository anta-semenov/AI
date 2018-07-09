import fetch from 'node-fetch'
import fs from 'fs'
import dateFns from 'date-fns'

export const getAlphavantageData = (id, startDate, endDate, fileName) => {
  let fullData = false
  if (!startDate || !endDate || dateFns.differenceInDays(endDate, startDate) > 100 || dateFns.differenceInDays(new Date(), startDate)) {
    fullData = true
  }
  return fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${id}${fullData ? '&outputsize=full' : ''}&apikey=XQC5IX3KBITKPCMA`)
    .then((res) => res.json())
    .then((data) => {
      const result = []
      Object.keys(data['Time Series (Daily)']).forEach((key) => {
        const date = dateFns.parse(key)
        if ((startDate && date < startDate) || (endDate && date > endDate)) {
          return
        }
        const dayDataRaw = data['Time Series (Daily)'][key]
        const dayData = [
          key,
          Number(dayDataRaw['1. open']),
          Number(dayDataRaw['2. high']),
          Number(dayDataRaw['3. low']),
          Number(dayDataRaw['4. close']),
        ]

        result.push(dayData)
      })

      if (!fileName) {
        return result
      } else {
        fs.writeFileSync(fileName, JSON.stringify({
          dataset: { data: result }
        }))
      }
    })
}
