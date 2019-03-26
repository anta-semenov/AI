import * as fs from 'fs'
import * as path from 'path'

export const load = fileName => {
  const filePath = path.resolve('../DataSet', `${fileName}.json`)
  return JSON.parse(fs.readFileSync(filePath))
}

export const save = (fileName, data) => {
  const filePath = path.resolve('../DataSet', `${fileName}.json`)
  return fs.writeFileSync(filePath, JSON.stringify(data))
}
