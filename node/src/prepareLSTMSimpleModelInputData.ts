import { load, save } from './utils/file'
import { DataType, InstrumentsData, DayData, Instrument, ExtremumPeriod, KeyedDictionary, InstrumentEvaluationDayData } from './types'
import { normalize } from './utils/standard'
import 'majime'

// для просто модели входом будут просто нормализованные цены для каждого периода для 11 инструментов
// выходы будут такими же как и для предыдущей модели
// для входа LSTM нужно будет скомпоновыть данные по 21 (но это должно быть параметром)

const timeSteps = 20

const getNormalizedDayData = (dataItem: DayData): number[] => Instrument.all
  .map((instrument) => {
    const instrumentDayData = dataItem[instrument]
    if (instrumentDayData == null) { throw Error('No instrument data for day') }
    return ExtremumPeriod.all
      .map((period) => {
        if (instrumentDayData.extremumData[period] == null) { throw Error('No period data') }
        const { min, max } = instrumentDayData.extremumData[period]
        const accuracy = 5
        return [
          Number(normalize(instrumentDayData.open, min, max).toFixed(accuracy)),
          Number(normalize(instrumentDayData.high, min, max).toFixed(accuracy)),
          Number(normalize(instrumentDayData.low, min, max).toFixed(accuracy)),
          Number(normalize(instrumentDayData.close, min, max).toFixed(accuracy)),
        ]
      })
      .flatten()
  })
  .flatten()

const getSymbolDayResult = (tomorrowOpen: number, open: number, low: number, high: number, vol: number): [1, 0] | [0, 1] | [0, 0] => {
  const openDiff = Math.abs(tomorrowOpen - open)
  const lowDropdown = Math.abs(low - open)
  const highDropdown = Math.abs(high - open)

  if (tomorrowOpen > open && openDiff > 0.8 * vol && lowDropdown < vol * 0.6) {
    return [1, 0]
  } else if (tomorrowOpen < open && openDiff > 0.8 * vol && highDropdown < vol * 0.6) {
    return [0, 1]
  } else {
    return [0, 0]
  }
}



interface DayResult {
  input: number[][],
  output: Array<1 | 0>,
  raw: KeyedDictionary<Instrument, InstrumentEvaluationDayData>
}

const prepareLSTMData = (instrumentsData: InstrumentsData, dataType: DataType = DataType.LearnData) => {
  const resultData: DayResult[] = []

  const source = dataType === DataType.LearnData ? instrumentsData.LearnData.slice(120) : instrumentsData.TestData

  console.log('source length', source.length)

  source.forEach((dataItem, index) => {
    if (index < timeSteps) {
      return
    } else if (index < source.length - 1) {
      const rawData: KeyedDictionary<Instrument, InstrumentEvaluationDayData> = {}
      const dayOutput: Array<1 | 0> = Instrument.all
        .map((instrument) => {
          const instrumentDayData = dataItem[instrument]
          const tomorrowInstrumentDayData = source[index + 1] != null ? source[index + 1][instrument] : null
          if (instrumentDayData == null || tomorrowInstrumentDayData == null) { throw Error('No instrument or tomorrow data')}

          rawData[instrument] = {
            date: instrumentDayData.date,
            open: instrumentDayData.open,
            close: instrumentDayData.close,
            low: instrumentDayData.low,
            high: instrumentDayData.high,
            avgVol: instrumentDayData.avgVol,
          }

          return getSymbolDayResult(
            tomorrowInstrumentDayData.open,
            instrumentDayData.open,
            instrumentDayData.low,
            instrumentDayData.high,
            instrumentDayData.avgVol,
          )
        })
        .flatten()

      const dayInput: number[][] = source
        .slice(index - timeSteps, index)
        .map(getNormalizedDayData)

      resultData.push({
        input: dayInput,
        output: dayOutput,
        raw: rawData,
      })
    }
  })

  return resultData
}

const dayData = load('perDateData') as InstrumentsData

const tfData = prepareLSTMData(dayData, DataType.LearnData)
save('tfData', tfData)
console.log('learn data size', tfData.length)

const tfTestData = prepareLSTMData(dayData, DataType.TestData)
save('tfTestData', tfTestData)
console.log('test data size', tfTestData.length)
