// import {load, save} from './utils/file'
// import {prepareTFData} from './tfDataConverter'
import {symbols} from './constants'
import fs from 'fs'
// import {evaluateModel} from './evaluation'
// import {getAlphavantageData} from './utils/alphavantageRequest'
// import {evolutionStrategy} from './study/evolutionStrategy'
// import {kohonenNetStudy} from './study/kohonenStudy'
// import {mapMatrix} from './utils/mapMatrix'
// import convertData from './utils/dataConvertation'
// import {donwloadOperatingData} from './utils/downloadDayData'

const symbolsData = {}
const testPayload = {}
const prevDaySymbolsData = {}
symbols.forEach((symbol) => {
  const symbolRawData = JSON.parse(fs.readFileSync(`../OperatingData/${symbol}.json`))
  symbolsData[symbol] = symbolRawData

  testPayload[symbol] = {
    date: symbolRawData.dayData[0].date,
    open: symbolRawData.dayData[0].open,
    close: symbolRawData.dayData[0].close,
    low: symbolRawData.dayData[0].low,
    high: symbolRawData.dayData[0].high,
  }

  const [day1, ...restDayData] = symbolRawData.dayData
  const [lastlow, ...rest20Low] = symbolRawData.last20Low
  const [lastHigh, ...rest20High] = symbolRawData.last20High
  const [lastVol, ...restVolatility] = symbolRawData.volatility
  prevDaySymbolsData[symbol] = {
    lastDate: restDayData[0].date,
    minAbsolute: restDayData[0].minAbsolute,
    maxAbsolute: restDayData[0].maxAbsolute,
    dayData: restDayData,
    last20Low: rest20Low,
    last20High: rest20High,
    volatility: restVolatility
  }
})

fs.writeFileSync('../lambdaData/symbolsData.json', JSON.stringify(symbolsData))
fs.writeFileSync('../lambdaData/testPayload.json', JSON.stringify(testPayload))
fs.writeFileSync('../lambdaData/prevDaySymbolsData.json', JSON.stringify(prevDaySymbolsData))

// donwloadOperatingData()

// getAlphavantageData('XOM', undefined, undefined, '../DataSetsRaw/XOM.json')
//convertData()

// const data = load('data')

// const layers = [
//   {
//     type: 'convolution',
//     size: [6, 4, 4, 15],
//     step: 2,
//     trashold: 14
//   },
//   {
//     type: 'convolution',
//     size: [10, 6, 4],
//     step: 2,
//     trashold: 20,
//   },
//   {
//     type: 'convolution',
//     size: [12, 10, 4],
//     step: 2,
//     trashold: 30
//   },
//   {
//     type: 'fullConnected',
//     size: symbols.length * 2 * 6
//   },
//   {
//     type: 'fullConnected',
//     size: symbols.length * 2
//   }
// ]
//
// evolutionStrategy(100, data.learnData, layers, 10)

// кохонен можно обучить на случайных данных
// т.е. надо просто всю дату слить в одно, можно сделать массив из разных инпутов по инструментам

// const normalize = (value, min, max) => (value - min) / (max - min)
// const learnDataLocal = []
// symbols.forEach(symbol => {
//   const symbolData = data.learnData[symbol].map(({open, close, high, low, maxLocal, minLocal, date}) => {
//     if (close < minLocal || low < minLocal || open < minLocal) {
//       console.log('123', new Date(date), close, low, minLocal)
//     }
//     return [
//       normalize(open, minLocal, maxLocal),
//       normalize(high, minLocal, maxLocal),
//       normalize(low, minLocal, maxLocal),
//       normalize(close, minLocal, maxLocal)
//     ]
//   })
//   learnDataLocal.push(...mapMatrix(symbolData, [22, 4], 1, subrange => subrange.reverse()))
// })
//
// const layers = [
//   {
//     type: 'kohonen',
//     size: [10, 4, 4],
//     step: 2
//   },
//   {
//     type: 'kohonen',
//     size: [16, 4],
//     step: 2
//   },
//   {
//     type: 'kohonen',
//     size: [20, 4],
//     step: 2
//   }
// ]
//
// const localLayers = kohonenNetStudy(learnDataLocal, layers)
// save('kohonenLocalLayers', localLayers)
//
// const learnDataAbsolute = []
// symbols.forEach(symbol => {
//   const symbolData = data.learnData[symbol].map(({open, close, high, low, maxAbsolute, minAbsolute}) => [
//     normalize(open, minAbsolute, maxAbsolute),
//     normalize(high, minAbsolute, maxAbsolute),
//     normalize(low, minAbsolute, maxAbsolute),
//     normalize(close, minAbsolute, maxAbsolute)
//   ])
//   learnDataAbsolute.push(...mapMatrix(symbolData, [22, 4], 1, subrange => subrange.reverse()))
// })
// const absoluteLayers = kohonenNetStudy(learnDataAbsolute, layers)
// save('kohonenAbsoluteLayers', absoluteLayers)

// const kohonenAbsoluteLayers = load('kohonenAbsoluteLayers')
// const kohonenLocalLayers = load('kohonenLocalLayers')
// const dayData = load('perDateData')
// //
// const resultData = prepareTFData(symbols, dayData, kohonenAbsoluteLayers, kohonenLocalLayers, 'testData')
//
// save('tfTestData', resultData)

// {input: [[]]}

// const testData = load('tfData')
// console.log('++++++', testData[0].input.length);
// evaluateModel()
