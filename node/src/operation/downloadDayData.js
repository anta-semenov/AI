import {symbolSpecs, symbols, INPUT_DEEP} from '../constants'
import {getQuandlData} from '../utils/quandlRequests'
import {getAlphavantageData} from '../utils/alphavantageRequest'
import fs from 'fs'
import dateFns from 'date-fns'

const DEFAULT_MIN = 999999999999

const downloadSymbolData = (symbol, symbolSpec, date) => {
  const symbolFileName = `../OperatingData/${symbol}.json`
  let storedData = {
    lastDate: new Date(2000, 0, 1).getTime(),
    minAbsolute: DEFAULT_MIN,
    maxAbsolute: 0,
    dayData: [],
    last20Low: [],
    last20High: [],
    volatility: [],
  }
  if (fs.existsSync(symbolFileName)) {
    storedData = JSON.parse(fs.readFileSync(symbolFileName))
  }

  if (storedData.lastDate === date.getTime()) {
    return Promise.resolve()
  }

  let requestPromise
  if (symbolSpec.provider === 'quandl') {
    requestPromise = getQuandlData
  } else if (symbolSpec.provider === 'alphavantage') {
    requestPromise = getAlphavantageData
  }

  return requestPromise(symbolSpec.id, new Date(storedData.lastDate), date)
    .then((newData) => {
      const convertNumber = symbolSpec.processingValue
      const tempData = newData.map(rawDayData => {
        return ({
          date: dateFns.parse(rawDayData[0]).getTime(),
          open: convertNumber(rawDayData[1]),
          high: convertNumber(rawDayData[2]),
          low: convertNumber(rawDayData[3]),
          close: convertNumber(rawDayData[4])
        })
      }).sort((a, b) => a.date - b.date)

      tempData.forEach((dayData, index, array) => {
        const open = dayData.open || array[index - 1].close
        const close = dayData.close || array[index + 1].open
        const high = Math.max(dayData.high || 0, open, close)
        const low = Math.min(dayData.low || DEFAULT_MIN, open, close)

        storedData.minAbsolute = Math.min(storedData.minAbsolute, low || DEFAULT_MIN)
        storedData.maxAbsolute = Math.max(storedData.maxAbsolute, high || 0)
        storedData.last20Low.unshift(low)
        storedData.last20High.unshift(high)
        storedData.volatility.unshift(Math.abs(high - low))

        if (storedData.last20Low.length > INPUT_DEEP) {
          storedData.last20Low.pop()
          storedData.last20High.pop()
          storedData.volatility.pop()
        }

        const dataForSet = ({
          date: dayData.date,
          open,
          close,
          high,
          low,
          maxAbsolute: storedData.maxAbsolute,
          minAbsolute: storedData.minAbsolute,
          maxLocal: storedData.last20High.reduce((res, item) => Math.max(res, item || 0), 0),
          minLocal: storedData.last20Low.reduce((res, item) => Math.min(res, item || DEFAULT_MIN), DEFAULT_MIN),
          avgVol: Math.trunc(storedData.volatility.reduce((res, item) => res + item, 0) * 100000 / storedData.volatility.length) / 100000
        })

        storedData.dayData.unshift(dataForSet)
        if (storedData.dayData.length > INPUT_DEEP) {
          storedData.dayData.pop()
        }
      })
      storedData.lastDate = date.getTime()

      fs.writeFileSync(symbolFileName, JSON.stringify(storedData))
    })
}

const donwloadNextSymbol = (index) => {
  if (index >= symbols.length) {
    return
  } else {
    downloadSymbolData(symbols[index], symbolSpecs[symbols[index]], dateFns.endOfYesterday())
      .then(() => setTimeout(() => donwloadNextSymbol(index + 1), 1000))
  }
}

// export const donwloadOperatingData = () => {
//   donwloadNextSymbol(0)
// }

donwloadNextSymbol(0)
