import {load, save} from './utils/file'
import {symbols} from './constants'
import {mapMatrix} from './utils/mapMatrix'
import {kohonenNetStudy} from './study/kohonenStudy'

// кохонен можно обучить на случайных данных
// т.е. надо просто всю дату слить в одно, можно сделать массив из разных инпутов по инструментам
const data = load('data')
const normalize = (value, min, max) => (value - min) / (max - min)
const learnDataLocal = []
symbols.forEach(symbol => {
  const symbolData = data.learnData[symbol].map(({open, close, high, low, maxLocal, minLocal, date}) => {
    if (close < minLocal || low < minLocal || open < minLocal) {
      console.log('123', new Date(date), close, low, minLocal)
    }
    return [
      normalize(open, minLocal, maxLocal),
      normalize(high, minLocal, maxLocal),
      normalize(low, minLocal, maxLocal),
      normalize(close, minLocal, maxLocal)
    ]
  })
  learnDataLocal.push(...mapMatrix(symbolData, [22, 4], 1, subrange => subrange.reverse()))
})

const layers = [
  {
    type: 'kohonen',
    size: [6, 4, 4],
    step: 2
  },
  {
    type: 'kohonen',
    size: [8, 4],
    step: 2
  },
  {
    type: 'kohonen',
    size: [10, 4],
    step: 2
  }
]

const localLayers = kohonenNetStudy(learnDataLocal, layers)
save('kohonenLocalLayers', localLayers)

const learnDataAbsolute = []
symbols.forEach(symbol => {
  const symbolData = data.learnData[symbol].map(({open, close, high, low, maxAbsolute, minAbsolute}) => [
    normalize(open, minAbsolute, maxAbsolute),
    normalize(high, minAbsolute, maxAbsolute),
    normalize(low, minAbsolute, maxAbsolute),
    normalize(close, minAbsolute, maxAbsolute)
  ])
  learnDataAbsolute.push(...mapMatrix(symbolData, [22, 4], 1, subrange => subrange.reverse()))
})
const absoluteLayers = kohonenNetStudy(learnDataAbsolute, layers)
save('kohonenAbsoluteLayers', absoluteLayers)
