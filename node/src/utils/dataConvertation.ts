import * as fs from 'fs'
import * as path from 'path'
import * as dateFns from 'date-fns'
import { INPUT_DEEP, symbolSpecs } from '../constants'
import { Instrument, InstrumentSeparateData, InstrumentsData, InstrumentDayData, ExtremumPeriod, RawInstrumentData, KeyedDictionary, ExtremumDataStorage, ExtremumData, DataType } from '../types'
import { mapValues } from './standard'

let nullOpenCount = 0
let nullCloseCount = 0
let nullHighCount = 0
let nullLowCount = 0

const DEFAULT_MIN = 999999999999

export const convertData = () => {
  const result: InstrumentSeparateData = {
    [DataType.LearnData]: {},
    [DataType.TestData]: {},
  }

  Instrument.all.forEach((instrument) => {
    const parsedSymbolData = processFile(instrument)
    result.LearnData[instrument] = parsedSymbolData.LearnData
    result.TestData[instrument] = parsedSymbolData.TestData
  })

  fs.writeFileSync(
    path.resolve('../DataSet', 'data.json'),
    JSON.stringify(result),
  )

  // make per date date

  const tempLearnData: { [date: number]: KeyedDictionary<Instrument, InstrumentDayData> } = {}
  const tempTestData: { [date: number]: KeyedDictionary<Instrument, InstrumentDayData> } = {}
  Instrument.all.forEach((instrument) => {
    // learnt data
    result.LearnData[instrument]!.forEach((dayData) => {
      const currentDayDate = tempLearnData[dayData.date] || {}
      tempLearnData[dayData.date] = {
        ...currentDayDate,
        [instrument]: dayData,
      }
    })

    // test data
    result.TestData[instrument]!.forEach((dayData) => {
      const currentDayDate = tempTestData[dayData.date] || {}
      tempTestData[dayData.date] = {
        ...currentDayDate,
        [instrument]: dayData,
      }
    })
  })

  const tempLearnDataArray = Object.values(tempLearnData).filter((dayData) => Object.keys(dayData).length === Instrument.all.length)
  const tempTestDataArray = Object.values(tempTestData).filter((dayData) => {
    if (Object.keys(dayData).length !== Instrument.all.length) {
      console.log('missing data: ', Object.keys(dayData), dateFns.format(((dayData as any)[Object.keys(dayData)[0]] as any).date, 'DD-MM-YYYY'))
    }
    return Object.keys(dayData).length === Instrument.all.length
  })

  const perDateData: InstrumentsData = {
    [DataType.LearnData]: tempLearnDataArray,
    [DataType.TestData]: tempTestDataArray,
  }

  fs.writeFileSync(
    path.resolve('../DataSet', 'perDateData.json'),
    JSON.stringify(perDateData),
  )

  const filteredLearnDataPerSymbol: KeyedDictionary<Instrument, InstrumentDayData[]> = {}
  const filteredTestDataPerSymbol: KeyedDictionary<Instrument, InstrumentDayData[]> = {}
  Instrument.all.forEach((instrument) => {
    filteredLearnDataPerSymbol[instrument] = []
    filteredTestDataPerSymbol[instrument] = []
  })

  tempLearnDataArray.forEach((dayData) => {
    Instrument.all.forEach((instrument) => {
      filteredLearnDataPerSymbol[instrument] = [...filteredLearnDataPerSymbol[instrument]!, dayData[instrument]!]
    })
  })

  tempTestDataArray.forEach((dayData) => {
    Instrument.all.forEach((instrument) => {
      filteredTestDataPerSymbol[instrument] = [...filteredTestDataPerSymbol[instrument]!, dayData[instrument]!]
    })
  })

  fs.writeFileSync(
    path.resolve('../DataSet', 'data.json'),
    JSON.stringify({
      [DataType.LearnData]: filteredLearnDataPerSymbol,
      [DataType.TestData]: filteredTestDataPerSymbol,
    }),
  )

  console.log('==============================')
  console.log('Data convertion finished')
  console.log('nullOpenCount: ', nullOpenCount)
  console.log('nullCloseCount: ', nullCloseCount)
  console.log('nullHighCount: ', nullHighCount)
  console.log('nullLowCount: ', nullLowCount)
  console.log(`learn data whole: ${result.LearnData[Instrument.AUD]!.length}, filtered: ${tempLearnDataArray.length}`)
  console.log(`test data whole: ${result.TestData[Instrument.AUD]!.length}, filtered: ${tempTestDataArray.length}`)
  console.log('==============================')
}

const processFile = (instrument: Instrument): Record<DataType, InstrumentDayData[]> => {
  const filePath = path.resolve('../DataSetsRaw', `${instrument}.json`)
  const fileData = JSON.parse(fs.readFileSync(filePath).toString()) as RawInstrumentData

  const convertNumber = symbolSpecs[instrument].processingValue

  const tempData = fileData.dataset.data.map((rawDayData) => {
    return ({
      date: dateFns.parse(rawDayData[0]).getTime(),
      open: convertNumber(rawDayData[1]),
      high: Math.max(convertNumber(rawDayData[2]), convertNumber(rawDayData[3])),
      low: Math.min(convertNumber(rawDayData[3]), convertNumber(rawDayData[2])),
      close: convertNumber(rawDayData[4]),
    })
  }).sort((a, b) => a.date - b.date)

  const extremumStorage: KeyedDictionary<ExtremumPeriod, ExtremumDataStorage> = {}
  ExtremumPeriod.all.forEach((period) => {
    extremumStorage[period] = { min: [], max: [] }
  })
  let volatilityStorage: number[] = []
  let learnData: InstrumentDayData[] = []
  let testData: InstrumentDayData[] = []

  tempData.forEach((dayData, index, array) => {
    const open = dayData.open || (array[index - 1] || {}).close || (array[index - 2] || {}).close || (array[index - 3] || {}).close
    const close = dayData.close || (array[index + 1] || {}).open || (array[index + 2] || {}).open || (array[index + 3] || {}).open
    const high = Math.max(dayData.high || 0, open || 0, close || 0)
    const low = Math.min(dayData.low || DEFAULT_MIN, open || DEFAULT_MIN, close || DEFAULT_MIN)

    if (!open) {
      nullOpenCount++
    }
    if (!close) {
      nullCloseCount++
    }
    if (!high) {
      nullHighCount++
    }
    if (!low) {
      nullLowCount++
    }

    if (!open || !close || !high || !low) {
      return
    }

    ExtremumPeriod.all.forEach((period) => {
      extremumStorage[period] = ExtremumPeriod.updateExtremumData({ min: low, max: high }, period, extremumStorage[period]!)
    })
    volatilityStorage = [...volatilityStorage, high - low]

    if (volatilityStorage.length > INPUT_DEEP) {
      volatilityStorage = volatilityStorage.slice(1)
    }

    const dataForSet: InstrumentDayData = ({
      date: dayData.date,
      open,
      close,
      high,
      low,
      avgVol: Math.trunc(volatilityStorage.reduce((res, item) => res + item, 0) * 100000 / volatilityStorage.length) / 100000,
      extremumData: mapValues(extremumStorage, (periodStorage) => ExtremumPeriod.getExtremumData(periodStorage!)) as Record<ExtremumPeriod, ExtremumData>,
    })

    if (dayData.date < dateFns.parse('2010-01-01').getTime()) {
      learnData = [...learnData, dataForSet]
    } else {
      testData = [...testData, dataForSet]
    }
  })

  return ({
    [DataType.LearnData]: learnData,
    [DataType.TestData]: testData,
  })
}
