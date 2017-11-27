import {netCreator} from '../neuroNet/net'
import {getInputs} from '../neuroNet/inputs'
import {outputHandlerCreator} from './outputHandler'
import {symbols, INPUT_DEEP} from '../constants'
import {createDNA, noiseArray} from './utils'
import {save} from '../utils/file'

export const runEntity = (layers, dna, data) => {
  const outputHandler = outputHandlerCreator(symbols)

  const net = netCreator({
    layers,
    numberOfSymbols: symbols.length,
    weigthsDNA: dna
  })

  const numberOfDays = data[symbols[0]].length - 1
  let dayIndex = INPUT_DEEP

  while (dayIndex < numberOfDays) {
    const inputs = getInputs(data, dayIndex)
    const outputs = net(inputs)
    outputHandler.handle(outputs, getDayPriceData(dayIndex + 1, data))

    dayIndex++
  }

  return outputHandler.getScore()
}

const getDayPriceData = (index, data) => {
  const result = {}

  symbols.forEach(symbol => {
    result[symbol] = data[symbol][index].open
  })

  return result
}

export const evolutionStrategy = (numberOfEntities, data, layers, numberOfGenerations) => {
  let generation = []

  for (let i = 0; i < numberOfEntities; i++) {
    generation[i] = createDNA({layers, numberOfSymbols: symbols.length})
  }

  let generationNumber = 0

  while (generationNumber < numberOfGenerations) {
    let generationScore = 0
    const entitiesScores = (new Array(numberOfEntities)).fill(0)
    const generationStartTime = Date.now()

    generation.forEach((entity, index) => {
      const score = runEntity(layers, entity, data)
      entitiesScores[index] = score
      generationScore += score
    })

    let maxScore = 0
    let bestEntityIndex = 0
    const entityWeigths = entitiesScores.map((score, index) => {
      if (score > maxScore) {
        maxScore = score
        bestEntityIndex = index
      }
      return score / generationScore
    })

    save('bestDNA', generation[bestEntityIndex])

    const resultDNA = combineDNA(generation, entityWeigths)

    for (let i = 0; i < numberOfEntities; i++) {
      generation[i] = noiseArray(resultDNA, 0.1)
    }

    console.log('==========================')
    console.log(`generation number: ${generationNumber}`)
    console.log(`time: ${Date.now() - generationStartTime} ms`)
    console.log(`best score: ${maxScore} by ${bestEntityIndex} entity`)
    console.log(`total generation score: ${generationScore}`);
    console.log('--------------------------')

    generationNumber++
  }
}

export const combineDNA = (generation, entitiesWeigths) => generation[0].map(
  (_, dnaIndex) => entitiesWeigths.reduce((res, weigth, index) => {
    return res + weigth * generation[index][dnaIndex]
  }, 0)
)
