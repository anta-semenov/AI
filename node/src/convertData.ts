import * as fs from 'fs'
// import * as dateFns from 'date-fns'
import { INPUT_DEEP } from './constants'
import { Instrument, SymbolData, KeyedDictionary, ExtremumPeriod, ExtremumData, InstrumentDayData } from './types'
import { mapKeysAndValues, mapValues } from './utils/standard'

// const INPUT_DEEP = 22
// const DEFAULT_MIN = 999999999999

const fxProSymbolMap: Record<Instrument, string> = {
  AUD: 'AUDUSD',
  EUR: 'EURUSD',
  GBP: 'GBPUSD',
  CHF: 'USDCHF',
  CAD: 'USDCAD',
  JPY: 'USDJPY',
  Brent: 'BRENT',
  Gold: 'GOLD',
  Silver: 'SILVER',
  Platinum: 'PLATINUM',
  Gas: 'NAT.GAS',
}

interface Dictionary<T> {
  [symbol: string]: T
}

const symbolsData = JSON.parse(fs.readFileSync('../lambdaData/DataForFix.json') as any) as KeyedDictionary<Instrument, SymbolData | OldSymbolData>
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

interface OldSymbolData {
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
  if (priceData.low === 0 || priceData.high === 0 || priceData.open === 0 || priceData.close === 0) {
    throw Error(`0 data`)
  }
  const result = {
    ...source,
  }
  if (result.lastDate > priceData.date) {
    return result
  }

  result.lastDate = priceData.date
  result.extremumStorage = mapKeysAndValues(
    result.extremumStorage,
    (period: ExtremumPeriod, storage) => ExtremumPeriod.updateExtremumData({ max: priceData.high, min: priceData.low }, period, storage!),
  )
  result.volatility = [Math.abs(priceData.high - priceData.low), ...result.volatility.slice(0, INPUT_DEEP - 1)]

  const dataForSet: InstrumentDayData = ({
    date: priceData.date,
    open: priceData.open,
    close: priceData.close,
    high: priceData.high,
    low: priceData.low,
    extremumData: mapValues(result.extremumStorage, (storage) => ExtremumPeriod.getExtremumData(storage!)) as Record<ExtremumPeriod, ExtremumData>,
    avgVol: Math.trunc(result.volatility.reduce((res, item) => res + item, 0) * 100000 / result.volatility.length) / 100000,
  })

  result.dayData = [dataForSet, ...result.dayData.slice(0, INPUT_DEEP - 1)]

  return result
}

const resultData: KeyedDictionary<Instrument, SymbolData> = {}

Instrument.all.forEach((symbol) => {
  const symbolData = symbolsData[symbol]!
  let tempData: SymbolData
  if ((symbolData as any).maxAbsolute && (symbolData as any).maxAbsolute) {
    tempData = {
      lastDate: 0,
      extremumStorage: {
        [ExtremumPeriod.Short]: { min: [], max: [] },
        [ExtremumPeriod.HalfYear]: { min: [], max: [] },
        [ExtremumPeriod.Year]: { min: [], max: [] },
        [ExtremumPeriod.Absolute]: { min: [(symbolData as OldSymbolData).minAbsolute], max: [(symbolData as OldSymbolData).maxAbsolute] },
      },
      volatility: [],
      dayData: [],
    }
  } else {
    tempData = {
      lastDate: 0,
      extremumStorage: {
        [ExtremumPeriod.Short]: { min: [], max: [] },
        [ExtremumPeriod.HalfYear]: { min: [], max: [] },
        [ExtremumPeriod.Year]: { min: [], max: [] },
        [ExtremumPeriod.Absolute]: (symbolData as SymbolData).extremumStorage.Absolute,
      },
      volatility: [],
      dayData: [],
    }
  }

  const prices = Object.values(fxProRawData[fxProSymbolMap[symbol]]).sort((a, b) => a.date - b.date).filter((priceData) => priceData.low != 0 && priceData.high != 0 && priceData.open != 0 && priceData.close != 0)

  if (prices.length < 290) {
    const message = `Don't have enought data for instrument ${symbol}, ${prices.length}`
    throw Error(message)
  }

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
