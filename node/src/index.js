// const convertData = require('./utils/dataConvertation')
// const math = require('mathjs')
import fs from 'fs'
import path from 'path'
import {symbols} from './constants'

const filePath = path.resolve('../DataSet', 'perDateData.json')
const fileData = JSON.parse(fs.readFileSync(filePath))

console.log('Original learnData length', fileData.learnData.length)
const learnData = fileData.learnData.filter(item => Object.keys(item).length === symbols.length)
console.log('Filtred learnData length', learnData.length);

console.log('Original testData length', fileData.testData.length)
const testData = fileData.testData.filter(item => Object.keys(item).length === symbols.length)
console.log('Filtred testData length', testData.length);

const newData = {
  learnData: {},
  testData: {}
}

learnData.forEach(dayData => {
  symbols.forEach(symbol => {
    if (!newData.learnData[symbol]) {
      newData.learnData[symbol] = []
    }
    newData.learnData[symbol].push(dayData[symbol])
  })
})

testData.forEach(dayData => {
  symbols.forEach(symbol => {
    if (!newData.testData[symbol]) {
      newData.testData[symbol] = []
    }
    newData.testData[symbol].push(dayData[symbol])
  })
})

fs.writeFileSync(
  path.resolve('../DataSet', 'data.json'),
  JSON.stringify(newData)
)
