import {symbols, INPUT_DEEP, NUMBER_OF_LOCAL_SECTORS, NUMBER_OF_ABSOULTE_SECTORS} from '../constants'
import math from 'mathjs'

interface InstrumentDayData {
  date: number,
  open: number,
  close: number,
  high: number,
  low: number,
  maxAbsolute: number,
  minAbsolute: number,
  maxLocal: number,
  minLocal: number
}

interface Data {
  [string]: InstrumentDayData[]
}

export const getInputs = (data: Data, index: number): number[][][] => {
  if (index + 1 < INPUT_DEEP) {
    throw new Error('not enougth data')
  }

  const result = []

  symbols.forEach(symbol => {
    const symbolData = data[symbol].slice(index - INPUT_DEEP + 1, index + 1)
    symbolData.reverse()
    const {maxAbsolute, minAbsolute, minLocal, maxLocal} = symbolData[0]
    const getAbsoluteSector = sectorCreator(minAbsolute, maxAbsolute, NUMBER_OF_ABSOULTE_SECTORS)
    const get20Sector = sectorCreator(minLocal, maxLocal, NUMBER_OF_ABSOULTE_SECTORS)
    const inputAbsolute = []
    const inputLocal = []

    symbolData.forEach((dayData: InstrumentDayData) => {
      inputLocal.push([
        getSectorArray(NUMBER_OF_LOCAL_SECTORS, get20Sector(dayData.open)),
        getSectorArray(NUMBER_OF_LOCAL_SECTORS, get20Sector(dayData.close)),
        getSectorArray(NUMBER_OF_LOCAL_SECTORS, get20Sector(dayData.high)),
        getSectorArray(NUMBER_OF_LOCAL_SECTORS, get20Sector(dayData.low))
      ])

      inputAbsolute.push([
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.open)),
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.close)),
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.high)),
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.low))
      ])
    })

    result.push(inputLocal, inputAbsolute)
  })

  return result
}

 export const getSectorArray = (size, sector) => (new Array(size)).fill(0).map((_, index) => index === sector ? 1 : 0)

export const sectorCreator = (min: number, max: number, numberOfSectors: number) => {
  const step = (max - min) / numberOfSectors
  return (value: number): number => Math.min(Math.trunc((value - min) / step), numberOfSectors - 1)
}
