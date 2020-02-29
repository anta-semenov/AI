import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { Dictionary } from './types/'
import { format, startOfDay, parse } from 'date-fns'
import 'majime'

interface HourData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  date: number
  timeStr: string
  dateStr: string
}

const digest: Dictionary<Dictionary<string | number>> = {}

const processFile  = (filename: string) => {
  const sourceData = readFileSync(resolve('../HourDataSetRaw', 'temp', filename)).toString()
  const instrumentName = filename.split('.')[0]

  const instrumentHoursData: Dictionary<HourData> = existsSync(resolve('../HourDataSetRaw', 'archive', `${instrumentName}.json`))
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
      volume: Number(hourData[5]),
      date: startOfDay(time).getTime(),
      timeStr: format(time, 'hh:mm'),
      dateStr: format(time, 'YYYY-MM-DD'),
    }
  })

  digest[instrumentName] = {
    amount: Object.keys(instrumentHoursData).length,
    earliestDtime: Object.values(instrumentHoursData).sorted((item1, item2) => item1.time - item2.time).firstElement()!.dateStr,
  }

  writeFileSync(resolve('../HourDataSetRaw', 'archive', `${instrumentName}.json`), JSON.stringify(instrumentHoursData))
}


readdirSync(resolve('../HourDataSetRaw', 'temp')).forEach(processFile)

writeFileSync(resolve('../HourDataSetRaw', 'digest.json'), JSON.stringify(digest))
