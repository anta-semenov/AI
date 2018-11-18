import fs from 'fs'
import path from 'path'
import dateFns from 'date-fns'
import {symbols, INPUT_DEEP, symbolSpecs} from '../constants'

let nullOpenCount = 0
let nullCloseCount = 0
let nullHighCount = 0
let nullLowCount = 0

const DEFAULT_MIN = 999999999999

export const convertData = () => {
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
    path.resolve('../DataSet', 'data.json'),
    JSON.stringify(result)
  )

  // make per date date

  let tempLearnData = {}
  Object.keys(result.learnData).forEach(symbol => {
    result.learnData[symbol].forEach(symbolDayData => {
      const currentDayDate = tempLearnData[symbolDayData.date] || {}
      tempLearnData[symbolDayData.date] = {
        ...currentDayDate,
        [symbol]: symbolDayData
      }
    })
  })
  tempLearnData = Object.values(tempLearnData).filter(dayData => Object.keys(dayData).length === symbols.length)

  let tempTestData = {}
  Object.keys(result.testData).forEach(symbol => {
    result.testData[symbol].forEach(symbolDayData => {
      const currentDayDate = tempTestData[symbolDayData.date] || {}
      tempTestData[symbolDayData.date] = {
        ...currentDayDate,
        [symbol]: symbolDayData
      }
    })
  })
  tempTestData = Object.values(tempTestData).filter(dayData => Object.keys(dayData).length === symbols.length)

  const perDateData = {
    learnData: tempLearnData,
    testData: tempTestData
  }

  fs.writeFileSync(
    path.resolve('../DataSet', 'perDateData.json'),
    JSON.stringify(perDateData)
  )

  const filteredLearnDataPerSymbol = {}
  const filteredTestDataPerSymbol = {}
  symbols.forEach(symbol => {
    filteredLearnDataPerSymbol[symbol] = []
    filteredTestDataPerSymbol[symbol] = []
  })

  tempLearnData.forEach(dayData => {
    symbols.forEach(symbol => {
      filteredLearnDataPerSymbol[symbol].push(dayData[symbol])
    })
  })

  tempTestData.forEach(dayData => {
    symbols.forEach(symbol => {
      filteredTestDataPerSymbol[symbol].push(dayData[symbol])
    })
  })

  fs.writeFileSync(
    path.resolve('../DataSet', 'data.json'),
    JSON.stringify({
      learnData: filteredLearnDataPerSymbol,
      testData: filteredTestDataPerSymbol
    })
  )

  console.log('==============================')
  console.log('Data convertion finished')
  console.log('nullOpenCount: ', nullOpenCount)
  console.log('nullCloseCount: ', nullCloseCount)
  console.log('nullHighCount: ', nullHighCount)
  console.log('nullLowCount: ', nullLowCount)
  console.log(`learn data whole: ${result.learnData[symbols[0]].length}, filtered: ${tempLearnData.length}`)
  console.log(`test data whole: ${result.testData[symbols[0]].length}, filtered: ${tempTestData.length}`)
  console.log('==============================')
}

const processFile = (symbol) => {
  const filePath = path.resolve('../DataSetsRaw', `${symbol}.json`)
  const fileData = JSON.parse(fs.readFileSync(filePath))

  const convertNumber = symbolSpecs[symbol].processingValue

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
  const volatility = []

  tempData.forEach((dayData, index, array) => {
    const open = dayData.open || array[index - 1].close || array[index - 2].close || array[index - 3].close
    const close = dayData.close || array[index + 1].open || array[index + 2].open || array[index + 3].open
    const high = Math.max(dayData.high || 0, open || 0, close || 0)
    const low = Math.min(dayData.low || DEFAULT_MIN, open || DEFAULT_MIN, close || DEFAULT_MIN)

    if (!open) {
      nullOpenCount++
    }
    if (!close) {
      nullCloseCount++
    }
    if (!high) {
      nullHighCount++
    }
    if (!low) {
      nullLowCount++
    }

    if (!open || !close || !high || !low) {
      return
    }

    minAbsolute = Math.min(minAbsolute, low || DEFAULT_MIN)
    maxAbsolute = Math.max(maxAbsolute, high || 0)
    last20Low.push(low)
    last20High.push(high)
    volatility.push(Math.abs(high - low))

    if (last20Low.length > INPUT_DEEP) {
      last20Low.shift()
      last20High.shift()
      volatility.shift()
    }

    const dataForSet = ({
      date: dayData.date,
      open,
      close,
      high,
      low,
      maxAbsolute,
      minAbsolute,
      maxLocal: last20High.reduce((res, item) => Math.max(res, item || 0), 0),
      minLocal: last20Low.reduce((res, item) => Math.min(res, item || DEFAULT_MIN), DEFAULT_MIN),
      avgVol: Math.trunc(volatility.reduce((res, item) => res + item, 0) * 100000 / volatility.length) / 100000
    })

    if (dayData.date < dateFns.parse('2009-01-01').getTime()) {
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
