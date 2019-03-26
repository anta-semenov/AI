import { load, save } from './utils/file'
import { prepareTFData } from './tfDataConverter'
import { DataType, InstrumentsData, NetWeights } from './types'

const kohonenNetWeights = load('kohonenNetWeights') as NetWeights
const dayData = load('perDateData') as InstrumentsData
//
const tfData = prepareTFData(dayData, kohonenNetWeights, DataType.LearnData)
save('tfData', tfData)
console.log('learn data size', tfData.length)

const tfTestData = prepareTFData(dayData, kohonenNetWeights, DataType.TestData)
save('tfTestData', tfTestData)
console.log('test data size', tfTestData.length)
