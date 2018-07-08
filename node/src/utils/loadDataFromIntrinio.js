const fs = require('fs')
const path = require('path')
const https = require('https')
const fetch = require('node-fetch')

const request = (tag, page) => new Promise(resolve => {
  const request = https.request({
    method: "GET",
    host: "api.intrinio.com",
    path: `/historical_data?identifier=XOM&item=${tag}&start_date=2000-01-01&end_date=2017-10-27&frequency=daily&page_number=${page}&page_size=1000`,
    headers: {
        "Authorization": "Basic " + new Buffer('38291603f37e1cc0ca0c35cebb7f7343:e3cb0f2064540bee64a6089e0d97884b').toString('base64')
    }
  }, response => {
    let json = ''
    response.on('data', chunk => json += chunk)
    response.on('end', () => resolve(JSON.parse(json)))
  })

  request.end()
})

const tags = new Array(20).fill('open', 0, 5).fill('close', 5, 10).fill('high', 10, 15).fill('low', 15)
tags

Promise.all([
  request('open_price', 1), // 0
  request('open_price', 2),
  request('open_price', 3),
  request('open_price', 4),
  request('open_price', 5),
  request('close_price', 1), // 5
  request('close_price', 2),
  request('close_price', 3),
  request('close_price', 4),
  request('close_price', 5),
  request('high_price', 1), // 10
  request('high_price', 2),
  request('high_price', 3),
  request('high_price', 4),
  request('high_price', 5),
  request('low_price', 1), // 15
  request('low_price', 2),
  request('low_price', 3),
  request('low_price', 4),
  request('low_price', 5)
]).then(dataArray => {
  const result = {}

  dataArray.forEach((data, index) => {
    data.data.forEach(day => {
      const temp = result[day.date] || {}
      result[day.date] = ({
        ...temp,
        [tags[index]]: day.value
      })
    })
  })

  const dataToWrite = Object.keys(result).map(date => {
    const {open, close, high, low} = result[date]
    return [
      date,
      open,
      high,
      low,
      close
    ]
  })

  fs.writeFileSync(
    path.resolve('../DataSetsRaw', 'XOM.json'),
    JSON.stringify({data: dataToWrite})
  )
})
