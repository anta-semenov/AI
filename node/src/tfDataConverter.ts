import { kohonenNet, kohonen, converKohonenClass } from './neuroNet/kohonen'
import { INPUT_DEEP } from './constants'
import { ExtremumPeriod, NetWeights, DayData, Instrument, InstrumentsData, DataType, KeyedDictionary, NetworkType, InstrumentEvaluationDayData } from './types'
import { groupByAndMap, mapValues, mapKeysAndValues, flattenArray, normalize } from './utils/standard'

type ExtremumLayersInput = KeyedDictionary<ExtremumPeriod, number[][]>

const addKohonenInputData = (input: ExtremumLayersInput, instrument: Instrument, dataItem: DayData): ExtremumLayersInput => {
  const { open, close, high, low, extremumData } = dataItem[instrument]!
  return mapKeysAndValues(input, (period: ExtremumPeriod, data: number[][]) => {
    const { min, max } = extremumData[period]
    const dayData = [
      Number(normalize(open, min, max).toFixed(4)),
      Number(normalize(high, min, max).toFixed(4)),
      Number(normalize(low, min, max).toFixed(4)),
      Number(normalize(close, min, max).toFixed(4)),
    ]
    return [dayData, ...data]
  })
}

let activeResults = 0

const getSymbolDayResult = (tomorrowOpen: number, open: number, low: number, high: number, vol: number): [1, 0] | [0, 1] | [0, 0] => {
  const openDiff = Math.abs(tomorrowOpen - open)
  const lowDropdown = Math.abs(low - open)
  const highDropdown = Math.abs(high - open)

  if (tomorrowOpen > open && openDiff > 0.8 * vol && lowDropdown < vol * 0.7) {
    activeResults++
    return [1, 0]
  } else if (tomorrowOpen < open && openDiff > 0.8 * vol && highDropdown < vol * 0.7) {
    activeResults++
    return [0, 1]
  } else {
    return [0, 0]
  }
}

interface DayResult {
  input: Array<1 | 0>,
  output: Array<1 | 0>,
  raw: KeyedDictionary<Instrument, InstrumentEvaluationDayData>
}

export const prepareTFData = (instrumentsData: InstrumentsData, weights: NetWeights, dataType: DataType = DataType.LearnData) => {
  const resultData: DayResult[] = []
  let inputBuffer: KeyedDictionary<Instrument, ExtremumLayersInput> = groupByAndMap(Instrument.all, (id) => id, () => groupByAndMap(ExtremumPeriod.all, (period) => period, () => []))

  const source = dataType === DataType.LearnData ? instrumentsData.LearnData : instrumentsData.TestData

  console.log('source length', source.length)
  activeResults = 0

  source.forEach((dataItem, index) => {
    if (index < INPUT_DEEP) {
      inputBuffer = mapKeysAndValues(inputBuffer, (instrument: Instrument, extremumData) => addKohonenInputData(extremumData!, instrument, dataItem))
      return
    } else if (index < source.length - 1) {
      const dayResult: DayResult = {
        input: [],
        output: [],
        raw: {},
      }

      Instrument.all.forEach((instrument) => {
        // Вход для символа представляет собой массив свечек где 0 это вчера
        // берем текущие данные и результат за пред день и вычисляем выходы
        const symbolDayData = dataItem[instrument]!
        const symbolDayResult = getSymbolDayResult(
          source[index + 1] != null ? source[index + 1][instrument]!.open : 0,
          symbolDayData.open,
          symbolDayData.low,
          symbolDayData.high,
          symbolDayData.avgVol,
        )
        dayResult.output.push(...symbolDayResult)
        dayResult.raw[instrument] = {
          date: symbolDayData.date,
          open: symbolDayData.open,
          close: symbolDayData.close,
          low: symbolDayData.low,
          high: symbolDayData.high,
          avgVol: symbolDayData.avgVol,
        }

        // Calculate result per symbols
        // run kohonenNet для каждого символа для local и absolute
        // и добовляем inputs результата
        // console.log('++++', inputBuffer[symbol].local.length);
        const convolutionKohonenResult = flattenArray(Object.keys(weights.extremumLayersWeights).map((period: ExtremumPeriod) => {
          return kohonenNet((inputBuffer[instrument]!)[period]!, weights.extremumLayersWeights[period])
        }))

        if (convolutionKohonenResult.length !== Object.keys(weights.extremumLayersWeights).length) {
          throw Error('kohonen extremum net returns not plain clases')
        }
        if (weights.type === NetworkType.Union) {
          const unnionKohonenClass = converKohonenClass(kohonen(convolutionKohonenResult, weights.unionLayerWeights.filters), weights.unionLayerSpecs.size)
          dayResult.input = [...dayResult.input, ...unnionKohonenClass]
        } else {
          const numberOfFilters = weights.extremumLayersSpecs[weights.extremumLayersSpecs.length - 1].size[0]
          const convertedConvolutionKohonenResult = flattenArray(convolutionKohonenResult.map((resultClass) => converKohonenClass(resultClass, numberOfFilters)))
          // TODO: update kohonen net types
          dayResult.input = [...dayResult.input, ...convertedConvolutionKohonenResult]
        }
      })

      // добавляем данные текущего дня в инпут сети
      inputBuffer = mapValues(inputBuffer, (extremumData: ExtremumLayersInput) => {
        return mapValues(extremumData, (dataArray) => dataArray!.slice(0, -1)) as Record<ExtremumPeriod, number[][]>
      })
      inputBuffer = mapKeysAndValues(inputBuffer, (instrument: Instrument, extremumData: ExtremumLayersInput) => addKohonenInputData(extremumData, instrument, dataItem))

      resultData.push(dayResult)
    }
  })
  console.log('active results: ', activeResults)

  return resultData
}
