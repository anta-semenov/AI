import {symbols, INPUT_DEEP} from '../constants'
import {kohonenNet} from '../neuroNet/kohonen'
import {load} from '../utils/file'
import fs from 'fs'

const normalize = (value, min, max) => (value - min) / (max - min)
const kohonenAbsoluteLayers = load('kohonenAbsoluteLayers')
const kohonenLocalLayers = load('kohonenLocalLayers')

const prepareKohonenOutput = () => {
  let result = []

  symbols.forEach((symbol) => {
    const symbolRawData = JSON.parse(fs.readFileSync(`../OperatingData/${symbol}.json`))
    if (symbolRawData.dayData.length !== INPUT_DEEP) {
      throw Error(`Day data size of ${symbol} not equal input size`)
    }

    const kohonenInputLocal = symbolRawData.dayData.map(({open, close, high, low, minLocal, maxLocal}) => {
      return [
        normalize(open, minLocal, maxLocal),
        normalize(high, minLocal, maxLocal),
        normalize(low, minLocal, maxLocal),
        normalize(close, minLocal, maxLocal),
      ]
    })
    const localTFInputs = kohonenNet(kohonenInputLocal, kohonenLocalLayers, true)

    const kohonenInputAbsolute = symbolRawData.dayData.map(({open, close, high, low, minAbsolute, maxAbsolute}) => {
      return [
        normalize(open, minAbsolute, maxAbsolute),
        normalize(high, minAbsolute, maxAbsolute),
        normalize(low, minAbsolute, maxAbsolute),
        normalize(close, minAbsolute, maxAbsolute),
      ]
    })
    const absoluteTFInputs = kohonenNet(kohonenInputAbsolute, kohonenAbsoluteLayers, true)

    result = [...result, ...localTFInputs, ...absoluteTFInputs]
  })

  fs.writeFileSync('../OperatingData/kohonenOutput.json', JSON.stringify(result))
}

prepareKohonenOutput()
