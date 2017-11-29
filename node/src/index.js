import {load} from './utils/file'
import {symbols} from './constants'
import {evolutionStrategy} from './study/evolutionStrategy'
// import convertData from './utils/dataConvertation'

// convertData()

const data = load('data')

const layers = [
  {
    type: 'convolution',
    size: [6, 4, 4, 15],
    step: 2,
    trashold: 14
  },
  {
    type: 'convolution',
    size: [10, 6, 4],
    step: 2,
    trashold: 20,
  },
  {
    type: 'convolution',
    size: [12, 10, 4],
    step: 2,
    trashold: 30
  },
  {
    type: 'fullConnected',
    size: symbols.length * 2 * 6
  },
  {
    type: 'fullConnected',
    size: symbols.length * 2
  }
]

evolutionStrategy(100, data.learnData, layers, 10)
