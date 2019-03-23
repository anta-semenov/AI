import { Instrument } from './symbols'

export enum ExtremumPeriod {
  Short = 'Short',
  Year = 'Year',
  Absolute = 'Absolute',
}

export namespace ExtremumPeriod {
  export const getStorageArrayLengthFor = (period: ExtremumPeriod): number => {
    switch (period) {
      case ExtremumPeriod.Short: return 22
      case ExtremumPeriod.Year: return 251
      case ExtremumPeriod.Absolute: return -1
    }
  }

  export const all: ExtremumPeriod[] = Object.values(ExtremumPeriod).filter((v) => typeof v === 'string')
}

interface ExtremumData {
  min: number
  max: number
}

export interface InstrumentDayData {
  date: number
  open: number
  close: number
  high: number
  low: number
  avgVol: number
  extremumData: Record<ExtremumPeriod, ExtremumData>
}

export type DayData = Record<Instrument, InstrumentDayData>

export enum DataType {
  LearnData = 'LearnData',
  TestData = 'TestData',
}

export type InstrumentsData = Record<DataType, DayData[]>
