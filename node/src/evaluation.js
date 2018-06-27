import {load} from './utils/file'
import fs from 'fs'
import {symbols} from './constants'

const predictions = JSON.parse(fs.readFileSync('./predictions.json'))
const dayData = load('perDateData')

const startDeposit = 1000
let deposit = startDeposit
