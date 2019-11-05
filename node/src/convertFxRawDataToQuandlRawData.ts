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

  fs.writeFileSync(
    path.resolve('../DataSetsRaw', `${instrument}.json`),
    JSON.stringify({ dataset: { data: instrumentData } }),
  )
})
