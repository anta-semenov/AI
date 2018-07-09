import fetch from 'node-fetch'
import fs from 'fs'
import dateFns from 'date-fns'

export const getQuandlData = (id, startDate, endDate, fileName) => {
  const startDateCondition = startDate ? `&start_date=${dateFns.format(startDate, 'YYYY-MM-DD')}` : ''
  const endDateCondition = endDate ? `&end_date=${dateFns.format(endDate, 'YYYY-MM-DD')}` : ''
  return fetch(`https://www.quandl.com/api/v3/datasets/CHRIS/${id}.json?api_key=hMdg3RhBV_oi6qsDQcrv${startDateCondition}${endDateCondition}`)
    .then((res) => res.json())
    .then((data) => {
      if (fileName) {
        fs.writeFileSync(fileName, JSON.stringify(data))
      } else {
        return data.dataset.data
      }
    })
}
