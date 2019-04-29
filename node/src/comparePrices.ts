import * as fs from 'fs'
import { Instrument, Dictionary, DayData } from './types'
import { startOfDay } from 'date-fns'

interface Price {
  open: number
  close: number
  high: number
  low: number
  date: number
}

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

const fxProRawData = JSON.parse(fs.readFileSync('../lambdaData/data.json') as any) as Dictionary<Dictionary<Price>>
const rawData = JSON.parse(fs.readFileSync('../DataSet/perDateData.json') as any).TestData as DayData[]

const defaultResultData = {
  averageHightDifference: 0,
  averageLowDifference: 0,
  averageOpenDifference: 0,
  averageCloseDifference: 0,
  averageVolatilityDifference: 0,
  averageBodyDifference: 0,
  averageTopRodDifference: 0,
  averageBottomRodDIfference: 0,
  maxHighDifference: 0,
  maxLowDifference: 0,
  maxOpenDifference: 0,
  maxCloseDifference: 0,
  maxVolatilityDifference: 0,
  maxBodyDifference: 0,
  maxTopRodDifference: 0,
  maxBottomRodDifference: 0,
}

const result = {} as any

Instrument.all.forEach((instrument) => {
  const tempResult = defaultResultData
  let count = 0

  Object.values(fxProRawData[fxProSymbolMap[instrument]]).forEach((fxProPrice) => {
    // console.log('++++++', startOfDay(fxProPrice.date).getTime())
    const date = startOfDay(fxProPrice.date).getTime()
    const defaultDayData = rawData.find((dayData) => startOfDay(dayData.AUD!.date).getTime() === date)
    const defaultPrices = defaultDayData && defaultDayData[instrument] ? defaultDayData[instrument] : undefined
    if (defaultPrices == null) {
      return
    }
    count = count + 1

    const highDifference = Math.abs(fxProPrice.high - defaultPrices.high) / fxProPrice.high
    const lowDifference = Math.abs(fxProPrice.low - defaultPrices.low) / fxProPrice.low
    const openDifference = Math.abs(fxProPrice.open - defaultPrices.open) / fxProPrice.open
    const closeDifference = Math.abs(fxProPrice.close - defaultPrices.close) / fxProPrice.close
    const volatilityDifference = Math.abs((fxProPrice.high - fxProPrice.low) - (defaultPrices.high - defaultPrices.low)) / (fxProPrice.high - fxProPrice.low)
    const bodyDifference = Math.abs((fxProPrice.open - fxProPrice.close) - (defaultPrices.open - defaultPrices.close)) / (Math.abs(fxProPrice.open - fxProPrice.close) || 1)
    const topRodDifference = Math.abs((fxProPrice.high - Math.max(fxProPrice.open, fxProPrice.close)) - (defaultPrices.high - Math.max(defaultPrices.open, defaultPrices.close))) / ((fxProPrice.high - Math.max(fxProPrice.open, fxProPrice.close)) || 1)
    const bottomRodDifference = Math.abs((Math.min(fxProPrice.open, fxProPrice.close) - fxProPrice.low) - (Math.min(defaultPrices.open, defaultPrices.close) - defaultPrices.low)) / ((Math.min(fxProPrice.open, fxProPrice.close) - fxProPrice.low) || 1)

    tempResult.averageHightDifference = tempResult.averageHightDifference + highDifference
    tempResult.averageLowDifference = tempResult.averageLowDifference + lowDifference
    tempResult.averageOpenDifference = tempResult.averageOpenDifference + openDifference
    tempResult.averageCloseDifference = tempResult.averageCloseDifference + closeDifference
    tempResult.averageVolatilityDifference = tempResult.averageVolatilityDifference + volatilityDifference
    tempResult.averageBodyDifference = tempResult.averageBodyDifference + bodyDifference
    tempResult.averageTopRodDifference = tempResult.averageTopRodDifference + topRodDifference
    tempResult.averageBottomRodDIfference = tempResult.averageBottomRodDIfference + bottomRodDifference

    tempResult.maxHighDifference = Math.max(tempResult.maxHighDifference, highDifference)
    tempResult.maxLowDifference = Math.max(tempResult.maxLowDifference, lowDifference)
    tempResult.maxOpenDifference = Math.max(tempResult.maxOpenDifference, openDifference)
    tempResult.maxCloseDifference = Math.max(tempResult.maxCloseDifference, closeDifference)
    tempResult.maxVolatilityDifference = Math.max(tempResult.maxVolatilityDifference, volatilityDifference)
    tempResult.maxBodyDifference = Math.max(tempResult.maxBodyDifference, bodyDifference)
    tempResult.maxTopRodDifference = Math.max(tempResult.maxTopRodDifference, topRodDifference)
    tempResult.maxBottomRodDifference = Math.max(tempResult.maxBottomRodDifference, bottomRodDifference)
  })

  count = Math.max(count, 1)

  tempResult.averageHightDifference = tempResult.averageHightDifference / count
  tempResult.averageLowDifference = tempResult.averageLowDifference / count
  tempResult.averageOpenDifference = tempResult.averageOpenDifference / count
  tempResult.averageCloseDifference = tempResult.averageCloseDifference / count
  tempResult.averageVolatilityDifference = tempResult.averageVolatilityDifference / count
  tempResult.averageBodyDifference = tempResult.averageBodyDifference / count
  tempResult.averageTopRodDifference = tempResult.averageTopRodDifference / count
  tempResult.averageBottomRodDIfference = tempResult.averageBottomRodDIfference / count

  result[instrument] = tempResult
})

fs.writeFileSync('../DataSet/priceComparision.json', JSON.stringify(result))
