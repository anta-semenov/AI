import * as fs from 'fs'
// import * as dateFns from 'date-fns'
import {INPUT_DEEP} from './constants'

// const INPUT_DEEP = 22
const DEFAULT_MIN = 999999999999

enum Symbol {
  AUD = 'AUD',
  EUR = 'EUR',
  GBP = 'GBP',
  CHF = 'CHF',
  CAD = 'CAD',
  JPY = 'JPY',
  Brent = 'Brent',
  Gold = 'Gold',
  Silver = 'Silver',
  Platinum = 'Platinum',
  Gas = 'Gas',
}

const fxProSymbolMap: { [symbol: string]: string } = {
  AUD: 'AUDUSD',
  EUR: 'EURUSD',
  GBP: 'GBPUSD',
  CHF: 'USDCHF',
  CAD: 'USDCAD',
  JPY: 'USDJPY',
  Brent: 'BRENT',
  Gold: 'GOLD',
  Wheat: '#Wheat_U8',
  Soybean: '#Soybean_U8',
  XOM: '#ExxonMobil',
  Silver: 'SILVER',
  Platinum: 'PLATINUM',
  Gas: 'NAT.GAS',
}

interface Dictionary<T> {
  [symbol: string]: T
}

const symbolsData = JSON.parse(fs.readFileSync('../lambdaData/DataForFix.json') as any) as Dictionary<SymbolData>
const fxProRawData = JSON.parse(fs.readFileSync('../lambdaData/data.json') as any) as Dictionary<Dictionary<Price>>

interface Price {
  open: number
  close: number
  high: number
  low: number
  date: number
}

interface DayData {
  date: number
  open: number
  close: number
  high: number
  low: number
  maxAbsolute: number
  minAbsolute: number
  maxLocal: number
  minLocal: number
  avgVol: number
}

interface SymbolData {
  lastDate: number
  minAbsolute: number
  maxAbsolute: number
  last20Low: number[]
  last20High: number[]
  volatility: number[]
  dayData: DayData[]
}

// Object.values(symbolsData).forEach((symbolData: SymbolData) => {
//   symbolData.dayData.forEach((dayData) => {
//     console.log(`213 ${dayData.high} ${dayData.low} ${dayData.high - dayData.low} ${Math.abs(dayData.high - dayData.low)}`)
//   })
// })

const addPriceData = (source: SymbolData, priceData: Price): SymbolData => {
  const result = {
    ...source
  }
  if (result.lastDate > priceData.date) {
    return result
  }

  result.lastDate = priceData.date
  result.maxAbsolute = Math.max(result.maxAbsolute, priceData.high)
  result.minAbsolute = Math.min(result.minAbsolute, priceData.low)
  result.last20Low.unshift(priceData.low)
  result.last20High.unshift(priceData.high)
  result.volatility.unshift(Math.trunc(Math.abs(priceData.high - priceData.low) * 100000) / 100000)

  if (result.last20Low.length > INPUT_DEEP) {
    result.last20Low = result.last20Low.slice(0, INPUT_DEEP)
    result.last20High = result.last20High.slice(0, INPUT_DEEP)
    result.volatility = result.volatility.slice(0, INPUT_DEEP)
  }

  const dataForSet = ({
    date: priceData.date,
    open: priceData.open,
    close: priceData.close,
    high: priceData.high,
    low: priceData.low,
    maxAbsolute: result.maxAbsolute,
    minAbsolute: result.minAbsolute,
    maxLocal: result.last20High.reduce((res, item) => Math.max(res, item || 0), 0),
    minLocal: result.last20Low.reduce((res, item) => Math.min(res, item || DEFAULT_MIN), DEFAULT_MIN),
    avgVol: Math.trunc(result.volatility.reduce((res, item) => res + item, 0) * 100000 / result.volatility.length) / 100000
  })

  result.dayData.unshift(dataForSet)
  if (result.dayData.length > INPUT_DEEP) {
    result.dayData = result.dayData.slice(0, INPUT_DEEP)
  }

  return result
}

const resultData: { [symbol: string]: SymbolData } = {}

Object.values(Symbol).forEach((symbol: string) => {
  const symbolData = symbolsData[symbol]
  let tempData: SymbolData = {
    lastDate: 0,
    minAbsolute: symbolData.minAbsolute,
    maxAbsolute: symbolData.maxAbsolute,
    last20Low: [],
    last20High: [],
    volatility: [],
    dayData: [],
  }

  const prices = Object.values(fxProRawData[fxProSymbolMap[symbol]]).sort((a, b) => a.date - b.date)

  prices.forEach((priceData) => {
    tempData = addPriceData(tempData, priceData)
  })

  resultData[symbol] = tempData
})

fs.writeFileSync('../lambdaData/symbolsDataNew.json', JSON.stringify(resultData))

// const getDif = (value1: number, value2: number): string => `${(Math.abs(value1 - value2) * 100/value1).toFixed(2)}%`
//
// const fxSymbolsData = JSON.parse(fs.readFileSync('../lambdaData/symbolsDataNew.json') as any) as Dictionary<SymbolData>
//
// Object.values(Symbol).forEach((symbol: string) => {
//   console.log('=================================')
//   console.log(`Checking symbol data ${symbol}`)
//
//   const fxSymbolData = fxSymbolsData[symbol]
//   const symbolData = symbolsData[symbol]
//
//   if (fxSymbolData.dayData.length !== symbolData.dayData.length ||
//       fxSymbolData.volatility.length !== symbolData.volatility.length ||
//       fxSymbolData.last20High.length !== symbolData.last20High.length ||
//       fxSymbolData.last20Low.length !== symbolData.last20Low.length) {
//     console.log('----------------------------')
//     console.log('Arrays length is not equal')
//     console.log('----------------------------')
//     return
//   }
//
//   fxSymbolData.dayData.forEach((fxDayData, index) => {
//     console.log(`Data: ${dateFns.format(dateFns.parse(fxDayData.date), 'DD-MM-YYYY')} | ${dateFns.format(dateFns.parse(symbolData.dayData[index].date), 'DD-MM-YYYY')}, low: ${getDif(fxSymbolData.last20Low[index], symbolData.last20Low[index])}, high: ${getDif(fxSymbolData.last20High[index], symbolData.last20High[index])}, close: ${getDif(fxDayData.close, symbolData.dayData[index].close)}`)
//   })
//
//
// })
