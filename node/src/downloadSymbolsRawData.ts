import { symbols, symbolSpecs } from './constants'
import { getQuandlData } from './utils/quandlRequests'
import { getAlphavantageData } from './utils/alphavantageRequest'
import * as path from 'path'

interface SymbolSpec {
  provider: 'quandl' | 'alphavantage',
  id: string
  apiUrl?: string
  processingValue: (value: number) => number
}

const downloadSymbolData = (symbol: string): Promise<void> => {
  const symbolSpec = symbolSpecs[symbol] as SymbolSpec
  const fileName = path.resolve(`../DataSetsRaw/${symbol}.json`)

  if (symbolSpec.provider === 'quandl') {
    return getQuandlData(symbolSpec.id, new Date(2000, 0, 3), new Date(), fileName)
  } else {
    return getAlphavantageData(symbolSpec.id, new Date(2000, 0, 3), new Date(), fileName).then(() => {})
  }
}


const donwloadNextSymbol = (index: number) => {
  if (index >= symbols.length) {
    return
  } else {
    downloadSymbolData(symbols[index])
      .then(() => setTimeout(() => donwloadNextSymbol(index + 1), 1000))
  }
}

donwloadNextSymbol(0)
