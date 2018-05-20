import {load, save} from './utils/file'
import {symbols} from './constants'
import {evolutionStrategy} from './study/evolutionStrategy'
import {kohonenNetStudy} from './study/kohonenStudy'
import {mapMatrix} from './utils/mapMatrix'
import convertData from './utils/dataConvertation'
import {INPUT_DEEP} from './constants'
import {kohonenNet} from './neuroNet/kohonen'

// convertData()

const data = load('data')

// const layers = [
//   {
//     type: 'convolution',
//     size: [6, 4, 4, 15],
//     step: 2,
//     trashold: 14
//   },
//   {
//     type: 'convolution',
//     size: [10, 6, 4],
//     step: 2,
//     trashold: 20,
//   },
//   {
//     type: 'convolution',
//     size: [12, 10, 4],
//     step: 2,
//     trashold: 30
//   },
//   {
//     type: 'fullConnected',
//     size: symbols.length * 2 * 6
//   },
//   {
//     type: 'fullConnected',
//     size: symbols.length * 2
//   }
// ]
//
// evolutionStrategy(100, data.learnData, layers, 10)

// кохонен можно обучить на случайных данных
// т.е. надо просто всю дату слить в одно, можно сделать массив из разных инпутов по инструментам

const normalize = (value, min, max) => (value - min) / (max - min)
// const learnDataLocal = []
// symbols.forEach(symbol => {
//   const symbolData = data.learnData[symbol].map(({open, close, high, low, maxLocal, minLocal, date}) => {
//     if (close < minLocal || low < minLocal || open < minLocal) {
//       console.log('123', new Date(date), close, low, minLocal)
//     }
//     return [
//       normalize(open, minLocal, maxLocal),
//       normalize(high, minLocal, maxLocal),
//       normalize(low, minLocal, maxLocal),
//       normalize(close, minLocal, maxLocal)
//     ]
//   })
//   learnDataLocal.push(...mapMatrix(symbolData, [22, 4], 1, subrange => subrange.reverse()))
// })
//
// const layers = [
//   {
//     type: 'kohonen',
//     size: [10, 4, 4],
//     step: 2
//   },
//   {
//     type: 'kohonen',
//     size: [16, 4],
//     step: 2
//   },
//   {
//     type: 'kohonen',
//     size: [20, 4],
//     step: 2
//   }
// ]
//
// const localLayers = kohonenNetStudy(learnDataLocal, layers)
// save('kohonenLocalLayers', localLayers)
//
// const learnDataAbsolute = []
// symbols.forEach(symbol => {
//   const symbolData = data.learnData[symbol].map(({open, close, high, low, maxAbsolute, minAbsolute}) => [
//     normalize(open, minAbsolute, maxAbsolute),
//     normalize(high, minAbsolute, maxAbsolute),
//     normalize(low, minAbsolute, maxAbsolute),
//     normalize(close, minAbsolute, maxAbsolute)
//   ])
//   learnDataAbsolute.push(...mapMatrix(symbolData, [22, 4], 1, subrange => subrange.reverse()))
// })
// const absoluteLayers = kohonenNetStudy(learnDataAbsolute, layers)
// save('kohonenAbsoluteLayers', absoluteLayers)

const kohonenAbsoluteLayers = load('kohonenAbsoluteLayers')
const kohonenLocalLayers = load('kohonenLocalLayers')
const dayData = load('perDateData')

const resultData = []
const inputBuffer = {}
symbols.forEach(symbol => {
  inputBuffer[symbol] = {
    local: [],
    absolute: []
  }
})

const unshiftKohonenInputData = (input, symbol, dataItem) => {
  const {open, close, high, low, minLocal, maxLocal, minAbsolute, maxAbsolute} = dataItem[symbol]
  inputBuffer[symbol].local.unshift([
    normalize(open, minLocal, maxLocal),
    normalize(high, minLocal, maxLocal),
    normalize(low, minLocal, maxLocal),
    normalize(close, minLocal, maxLocal)
  ])
  inputBuffer[symbol].absolute.unshift([
    normalize(open, minAbsolute, maxAbsolute),
    normalize(high, minAbsolute, maxAbsolute),
    normalize(low, minAbsolute, maxAbsolute),
    normalize(close, minAbsolute, maxAbsolute)
  ])
}

dayData.learnData.forEach((dataItem, index) => {
  const kohonenResult = []
  const outputResult = []
  if (index <= INPUT_DEEP) {
    symbols.forEach(symbol => {
      unshiftKohonenInputData(inputBuffer, symbol, dataItem[symbol])
    })
    return
  } else if (index < dayData.learnData.length - 1) {
    const dayResult = {
      input: [],
      output: []
    }

    symbols.forEach(symbol => {
      // Вход для символа представляет собой массив свечек где 0 это вчера
      // берем текущие данные и результат за пред день и вычисляем выходы

      // Calculate result per symbols
      // run kohonenNet для каждого символа
      // и добовляем inputs результата
    })


    // добавляем данные текущего дня в инпут сети
    inputBuffer.pop()
    unshiftKohonenInputData(inputBuffer, symbol, dataItem[symbol])
  }
})

// {input: [[]]}
