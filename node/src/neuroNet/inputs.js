import {symbols, INPUT_DEEP, NUMBER_OF_20_SECTORS, NUMBER_OF_ABSOULTE_SECTORS} from '../constants'

interface InstrumentDayData {
  date: number,
  open: number,
  close: number,
  high: number,
  low: number,
  maxAbsolute: number,
  minAbsolute: number,
  max20: number,
  min20: number
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
    const {maxAbsolute, minAbsolute, min20, max20} = symbolData[0]
    const getAbsoluteSector = sectorCreator(minAbsolute, maxAbsolute, NUMBER_OF_ABSOULTE_SECTORS)
    const get20Sector = sectorCreator(min20, max20, NUMBER_OF_ABSOULTE_SECTORS)
    const inputAbsolute = []
    const input20 = []

    symbolData.forEach((dayData: InstrumentDayData) => {
      input20.push([
        getSectorArray(NUMBER_OF_20_SECTORS, get20Sector(dayData.open)),
        getSectorArray(NUMBER_OF_20_SECTORS, get20Sector(dayData.close)),
        getSectorArray(NUMBER_OF_20_SECTORS, get20Sector(dayData.high)),
        getSectorArray(NUMBER_OF_20_SECTORS, get20Sector(dayData.low))
      ])

      inputAbsolute.push(
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.open)),
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.close)),
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.high)),
        getSectorArray(NUMBER_OF_ABSOULTE_SECTORS, getAbsoluteSector(dayData.low))
      )
    })

    result.push(input20, inputAbsolute)
  })
}

 export const getSectorArray = (size, sector) => (new Array(size)).fill(0).map((_, index) => index === sector ? 1 : 0)

export const sectorCreator = (min: number, max: number, numberOfSectors: number) => {
  const step = (max - min) / numberOfSectors
  return (value: number): number => Math.min(Math.trunc((value - min) / step), numberOfSectors - 1)
}
