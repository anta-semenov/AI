import { kohonenNet } from './neuroNet/kohonen'
import { INPUT_DEEP } from './constants'
import { ExtremumPeriod, NetWeights, DayData, Instrument, InstrumentsData, DataType } from './types'

const normalize = (value: number, min: number, max: number): number => (value - min) / (max - min)

type ExtremumLayersInput = Record<ExtremumPeriod, number[][]>

const unshiftKohonenInputData = (input: Record<Instrument, ExtremumLayersInput>, symbol: Instrument, dataItem: DayData) => {
  const { open, close, high, low, extremumData } = dataItem[symbol]
  Object.keys(ExtremumPeriod).forEach((period: ExtremumPeriod) => {
    const { min, max } = extremumData[period]
    input[symbol][period].unshift([
      normalize(open, min, max),
      normalize(high, min, max),
      normalize(low, min, max),
      normalize(close, min, max),
    ])
  })
}

const getSymbolDayResult = (tomorrowOpen: number, open: number, low: number, high: number, vol: number): [1, 0] | [0, 1] | [0, 0] => {
  const openDiff = Math.abs(tomorrowOpen - open)
  const lowDropdown = Math.abs(low - open)
  const highDropdown = Math.abs(high - open)

  if (tomorrowOpen > open && openDiff > 0.5 * vol && lowDropdown < vol) {
    return [1, 0]
  } else if (tomorrowOpen < open && openDiff > 0.5 * vol && highDropdown < vol) {
    return [0, 1]
  } else {
    return [0, 0]
  }
}



export const prepareTFData = (instrumentsData: InstrumentsData, weights: NetWeights, dataType: DataType = DataType.LearnData) => {
  const resultData = []
  const inputBuffer:  = {}
  Instrument.all.forEach((symbol) => {
    inputBuffer[symbol] = {
      local: [],
      absolute: []
    }
  })

  dayData[dataKey].forEach((dataItem, index) => {
    if (index < INPUT_DEEP) {
      symbols.forEach(symbol => {
        unshiftKohonenInputData(inputBuffer, symbol, dataItem)
      })
      return
    } else if (index < dayData[dataKey].length - 1) {
      const dayResult = {
        input: [],
        output: []
      }

      symbols.forEach(symbol => {
        // Вход для символа представляет собой массив свечек где 0 это вчера
        // берем текущие данные и результат за пред день и вычисляем выходы
        const symbolDayData = dataItem[symbol]
        const symbolDayResult = getSymbolDayResult(
          dayData[dataKey][index + 1][symbol].open,
          symbolDayData.open,
          symbolDayData.low,
          symbolDayData.high,
          symbolDayData.avgVol,
        )
        dayResult.output.push(...symbolDayResult)

        // Calculate result per symbols
        // run kohonenNet для каждого символа для local и absolute
        // и добовляем inputs результата
        // console.log('++++', inputBuffer[symbol].local.length);
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
