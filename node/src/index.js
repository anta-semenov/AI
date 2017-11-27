// const convertData = require('./utils/dataConvertation')
// const math = require('mathjs')
import {load} from './utils/file'
import {symbols} from './constants'
import {evolutionStrategy} from './study/evolutionStrategy'

const data = load('data')

evolutionStrategy(100, data, layers, 10)
