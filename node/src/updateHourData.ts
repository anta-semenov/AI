import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { Dictionary } from './types/'
import { format, startOfDay, parse } from 'date-fns'

interface HourData {
  time: number
  open: number
  high: number
  low: number
  close: number
  date: number
  timeStr: string
  dateStr: string
}

const processFile  = (filename: string) => {
  const sourceData = readFileSync(resolve('../HourDataSetRaw', 'temp', filename)).toString()
  const instrumentName = filename.split('.')[0]

  const instrumentHoursData: Dictionary<HourData> = existsSync(resolve('../HourDataSetRaw', `${instrumentName}.json`))
    ? JSON.parse(readFileSync(resolve('../HourDataSetRaw', 'archive', `${instrumentName}.json`)).toString())
    : {}

  sourceData.split('\r\n').forEach((hourDataString) => {
    const hourData = hourDataString.split('|')
    const time = parse(hourData[0]).getTime()

    instrumentHoursData[time] = {
      time,
      open: Number(hourData[1]),
      high: Number(hourData[2]),
      low: Number(hourData[3]),
      close: Number(hourData[4]),
      date: startOfDay(time).getTime(),
      timeStr: format(time, 'hh:mm'),
      dateStr: format(time, 'YYYY-MM-DD'),
    }
  })

  writeFileSync(resolve('../HourDataSetRaw', 'archive', `${instrumentName}.json`), JSON.stringify(instrumentHoursData))
}


readdirSync(resolve('../HourDataSetRaw', 'temp')).forEach(processFile)
