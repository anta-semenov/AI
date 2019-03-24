import { Instrument } from './symbols'
import { KeyedDictionary } from './standard'

export enum ExtremumPeriod {
  Short = 'Short',
  HalfYear = 'HalfYear',
  Year = 'Year',
  Absolute = 'Absolute',
}

export namespace ExtremumPeriod {
  export const getStorageArrayLengthFor = (period: ExtremumPeriod): number => {
    switch (period) {
      case ExtremumPeriod.Short: return 22
      case ExtremumPeriod.HalfYear: return 125
      case ExtremumPeriod.Year: return 251
      case ExtremumPeriod.Absolute: return -1
    }
  }

  export const updateExtremumData = (newValue: ExtremumData, period: ExtremumPeriod, storage: ExtremumDataStorage): ExtremumDataStorage => {
    if (period === ExtremumPeriod.Absolute) {
      return {
        min: [Math.min(newValue.min, ...storage.min)],
        max: [Math.max(newValue.max, ...storage.max)],
      }
    } else {
      const maxLength = getStorageArrayLengthFor(period)

      if (storage.max.length < maxLength) {
        return {
          min: [...storage.min, newValue.min],
          max: [...storage.max, newValue.max],
        }
      } else {
        return {
          min: [...storage.min.slice(1), newValue.min],
          max: [...storage.max.slice(1), newValue.max],
        }
      }
    }
  }

  export const getExtremumData = (storage: ExtremumDataStorage): ExtremumData => {
    return { min: Math.min(...storage.min), max: Math.max(...storage.max) }
  }

  export const all: ExtremumPeriod[] = Object.values(ExtremumPeriod).filter((v) => typeof v === 'string')
}

export interface ExtremumData {
  min: number
  max: number
}

export interface ExtremumDataStorage {
  min: number[]
  max: number[]
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

export type DayData = KeyedDictionary<Instrument, InstrumentDayData>

export enum DataType {
  LearnData = 'LearnData',
  TestData = 'TestData',
}

export type InstrumentsData = Record<DataType, DayData[]>

export type InstrumentSeparateData = Record<DataType, KeyedDictionary<Instrument, InstrumentDayData[]>>

export interface RawInstrumentData {
  dataset: {
    data: number[][],
  }
}
