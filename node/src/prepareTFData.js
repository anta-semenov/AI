import {load, save} from './utils/file'
import {prepareTFData} from './tfDataConverter'
import {symbols} from './constants'

const kohonenAbsoluteLayers = load('kohonenAbsoluteLayers')
const kohonenLocalLayers = load('kohonenLocalLayers')
const dayData = load('perDateData')
//
const tfData = prepareTFData(symbols, dayData, kohonenAbsoluteLayers, kohonenLocalLayers)
save('tfData', tfData)
console.log('learn data size', tfData.length)

const tfTestData = prepareTFData(symbols, dayData, kohonenAbsoluteLayers, kohonenLocalLayers, 'testData')
save('tfTestData', tfTestData)
console.log('test data size', tfTestData.length)
