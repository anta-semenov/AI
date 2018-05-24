import {kohonenNet} from './neuroNet/kohonen'
import {INPUT_DEEP} from './constants'

const normalize = (value, min, max) => (value - min) / (max - min)

const unshiftKohonenInputData = (input, symbol, dataItem) => {
  const {open, close, high, low, minLocal, maxLocal, minAbsolute, maxAbsolute} = dataItem[symbol]
  input[symbol].local.unshift([
    normalize(open, minLocal, maxLocal),
    normalize(high, minLocal, maxLocal),
    normalize(low, minLocal, maxLocal),
    normalize(close, minLocal, maxLocal)
  ])
  input[symbol].absolute.unshift([
    normalize(open, minAbsolute, maxAbsolute),
    normalize(high, minAbsolute, maxAbsolute),
    normalize(low, minAbsolute, maxAbsolute),
    normalize(close, minAbsolute, maxAbsolute)
  ])
}

const getSymbolDayResult = (tomorrowOpen, open, low, high) => {
  const openPercent = Math.abs(((tomorrowOpen - open) / open) * 100)
  const lowPercent = Math.abs(((low - open) / open) * 100)
  const highPercent = Math.abs(((high - open) / open) * 100)

  if (tomorrowOpen > open && openPercent > 2 && lowPercent < 10) {
    return [1, 0]
  } else if (tomorrowOpen < open && openPercent > 2 && highPercent < 10) {
    return [0, 1]
  } else {
    return [0, 0]
  }
}

export const prepareTFData = (symbols, dayData, kohonenAbsoluteLayers, kohonenLocalLayers) => {
  const resultData = []
  const inputBuffer = {}
  symbols.forEach(symbol => {
    inputBuffer[symbol] = {
      local: [],
      absolute: []
    }
  })

  dayData.learnData.forEach((dataItem, index) => {
    if (index <= INPUT_DEEP) {
      symbols.forEach(symbol => {
        unshiftKohonenInputData(inputBuffer, symbol, dataItem)
      })
      return
    } else if (index < dayData.learnData.length - 1) {
      const dayResult = {
        input: [],
        output: []
      }

      symbols.forEach(symbol => {
        // Вход для символа представляет собой массив свечек где 0 это вчера
        // берем текущие данные и результат за пред день и вычисляем выходы
        const symbolDayData = dataItem[symbol]
        const symbolDayResult = getSymbolDayResult(
          dayData.learnData[index + 1][symbol].open,
          symbolDayData.open,
          symbolDayData.low,
          symbolDayData.high,
        )
        dayResult.output.push(...symbolDayResult)

        // Calculate result per symbols
        // run kohonenNet для каждого символа для local и absolute
        // и добовляем inputs результата
        const localTFInputs = kohonenNet(inputBuffer[symbol].local, kohonenLocalLayers, true)
        const absoluteTFInputs = kohonenNet(inputBuffer[symbol].absolute, kohonenAbsoluteLayers, true)
        dayResult.input = [...dayResult.input, ...localTFInputs, ...absoluteTFInputs]

        // добавляем данные текущего дня в инпут сети
        inputBuffer[symbol].local.pop()
        inputBuffer[symbol].absolute.pop()
        unshiftKohonenInputData(inputBuffer, symbol, dataItem)
      })

      resultData.push(dayResult)
    }
  })

  return resultData
}
