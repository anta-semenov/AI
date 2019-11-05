import { Instrument } from './types'
import * as fs from 'fs'
import * as path from 'path'
import * as dateFns from 'date-fns'

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

const fxRawData = JSON.parse(fs.readFileSync(path.resolve('../DataSetsRaw', 'fxRawData.json')).toString())

const absoluteExtremumData = JSON.parse(fs.readFileSync(path.resolve('../lambdaData', 'DataForFix.json')).toString())

Instrument.all.forEach((instrument) => {
  const fxInstrumentData = fxRawData[fxProSymbolMap[instrument]]

  const convertPrice = (value: number) => {
    switch (instrument) {
      case Instrument.CAD:
      case Instrument.CHF:
        return 1 / value
      case Instrument.JPY:
        return 1000000 / value
      default:
        return value
    }
  }

  const instrumentData = Object.values(fxInstrumentData)
    .filter((data: any) => data.date !== 0)
    .sort((data1: any, data2: any) => data1.date - data2.date)
    .map((data: any) => [
      dateFns.format(data.date, 'YYYY-MM-DD'),
      convertPrice(data.open),
      convertPrice(data.high),
      convertPrice(data.low),
      convertPrice(data.close),
    ])

  const absoluteExtremumInstrumentData = [
    '2016-01-22',
    convertPrice(absoluteExtremumData[instrument].minAbsolute),
    convertPrice(absoluteExtremumData[instrument].maxAbsolute),
    convertPrice(absoluteExtremumData[instrument].minAbsolute),
    convertPrice(absoluteExtremumData[instrument].maxAbsolute),
  ]

  fs.writeFileSync(
    path.resolve('../DataSetsRaw', `${instrument}.json`),
    JSON.stringify({ dataset: { data: [absoluteExtremumInstrumentData, ...instrumentData] } }),
  )
})
