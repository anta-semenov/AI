const fs = require("fs")
const path = require("path")
const dateFns = require("date-fns")

const symbols = ['AUD', 'EUR', 'GBP', 'CHF', 'CAD', 'JPY', 'Brent', 'Gold', 'Wheat', 'Soybean', 'XOM']

let nullOpenCount = 0
let nullCloseCount = 0
let nullHighCount = 0
let nullLowCount = 0

const DEFAULT_MIN = 999999999999

const convertData = () => {
  const result = {
    learnData: {},
    testData: {}
  }

  symbols.forEach(symbol => {
    const parsedSymbolData = processFile(symbol)
    result.learnData[symbol] = parsedSymbolData.learnData
    result.testData[symbol] = parsedSymbolData.testData
  })

  fs.writeFileSync(
    path.resolve('../DataSet', `data.json`),
    JSON.stringify(result)
  )

  console.log('==============================')
  console.log('Data convertion finished')
  console.log('nullOpenCount: ', nullOpenCount)
  console.log('nullCloseCount: ', nullCloseCount)
  console.log('nullHighCount: ', nullHighCount)
  console.log('nullLowCount: ', nullLowCount)
  console.log('==============================')

  // make per date date

  const tempLearnData = {}
  Object.keys(result.learnData).forEach(symbol => {
    result.learnData[symbol].forEach(symbolDayData => {
      const currentDayDate = tempLearnData[symbolDayData.date] || {}
      tempLearnData[symbolDayData.date] = {
        ...currentDayDate,
        [symbol]: symbolDayData
      }
    })
  })

  const tempTestData = {}
  Object.keys(result.testData).forEach(symbol => {
    result.learnData[symbol].forEach(symbolDayData => {
      const currentDayDate = tempTestData[symbolDayData.date] || {}
      tempTestData[symbolDayData.date] = {
        ...currentDayDate,
        [symbol]: symbolDayData
      }
    })
  })

  const perDateData = {
    learnData: Object.values(tempLearnData),
    testData: Object.values(tempTestData)
  }

  fs.writeFileSync(
    path.resolve('../DataSet', `perDateData.json`),
    JSON.stringify(perDateData)
  )
}

const processFile = symbol => {
  const filePath = path.resolve('../DataSetsRaw', `${symbol}.json`)
  const fileData = JSON.parse(fs.readFileSync(filePath))

  const convertNumber = number => symbol !== 'JPY' ? number : number ? 1000/number : undefined

  const tempData = fileData.dataset.data.map(rawDayData => {
    return ({
      date: dateFns.parse(rawDayData[0]).getTime(),
      open: convertNumber(rawDayData[1]),
      high: convertNumber(rawDayData[2]),
      low: convertNumber(rawDayData[3]),
      close: convertNumber(rawDayData[4])
    })
  }).sort((a, b) => a.date - b.date)

  let minAbsolute = DEFAULT_MIN
  let maxAbsolute = 0
  const last20Low = []
  const last20High = []
  const learnData = []
  const testData = []

  tempData.forEach((dayData, index, array) => {
    const open = dayData.open || array[index - 1].close
    const close = dayData.close || array[index + 1].open
    const high = dayData.high || Math.max(open, close)
    const low = dayData.low || Math.min(open, close)

    minAbsolute = Math.min(minAbsolute, low || DEFAULT_MIN)
    maxAbsolute = Math.max(maxAbsolute, high || 0)
    last20Low.push(low)
    last20High.push(high)

    if (last20Low.length > 20) {
      last20Low.shift()
      last20High.shift()
    }

    const dataForSet = ({
      date: dayData.date,
      open,
      close,
      high,
      low,
      maxAbsolute,
      minAbsolute,
      max20: last20High.reduce((res, item) => Math.max(res, item || 0), 0),
      min20: last20Low.reduce((res, item) => Math.min(res, item || DEFAULT_MIN), DEFAULT_MIN)
    })

    if (dayData.date < dateFns.parse('2008-01-01').getTime()) {
      learnData.push(dataForSet)
    } else {
      testData.push(dataForSet)
    }
  })

  return ({
    learnData,
    testData
  })
}

module.exports = convertData
