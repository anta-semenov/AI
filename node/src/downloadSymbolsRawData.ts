import { symbolSpecs } from './constants'
import { getQuandlData } from './utils/quandlRequests'
import { getAlphavantageData } from './utils/alphavantageRequest'
import * as path from 'path'
import { Instrument } from './types'

interface SymbolSpec {
  provider: 'quandl' | 'alphavantage',
  id: string
  apiUrl?: string
  processingValue: (value: number) => number
}

const downloadSymbolData = (instrument: Instrument): Promise<void> => {
  const symbolSpec = symbolSpecs[instrument] as SymbolSpec
  const fileName = path.resolve(`../DataSetsRaw/${instrument}.json`)

  if (symbolSpec.provider === 'quandl') {
    return getQuandlData(symbolSpec.id, new Date(2000, 0, 3), new Date(), fileName)
  } else {
    return getAlphavantageData(symbolSpec.id, new Date(2000, 0, 3), new Date(), fileName).then(() => {})
  }
}


const donwloadNextSymbol = (index: number) => {
  if (index >= Instrument.all.length) {
    return
  } else {
    downloadSymbolData(Instrument.all[index])
      .then(() => setTimeout(() => donwloadNextSymbol(index + 1), 1000))
  }
}

donwloadNextSymbol(0)
