import * as fs from 'fs'
import { execSync } from 'child_process'

let maxDropDown = 100
let maxDepositRise = 10000

interface Evaluation {
  depositRise: number
  dropDown: number
  totalDeals: number
  winDeals: number
  loseDeals: number
}

const checkEvaluation = () => {
  const evaluation = JSON.parse(fs.readFileSync('./evaluationResult.json').toString()) as Evaluation
  const resultText = `depo%: ${evaluation.depositRise * 100}, maxDropDown: ${evaluation.dropDown}
total: ${evaluation.totalDeals}, win: ${evaluation.winDeals}, lose: ${evaluation.loseDeals}`
  console.log(resultText)

  if ((evaluation.dropDown < maxDropDown && evaluation.depositRise > maxDepositRise) ||
      (evaluation.dropDown / maxDropDown < 0.9 && evaluation.depositRise / maxDepositRise > 0.005 && evaluation.depositRise > 10000)) {
    maxDropDown = evaluation.dropDown
    maxDepositRise = evaluation.depositRise
    fs.copyFileSync('../DataSet/keras_config.json', '../LuckyModels/temp/keras_config.json')
    fs.copyFileSync('../DataSet/keras_weights.npy', '../LuckyModels/temp/keras_weights.npy')
    fs.copyFileSync('../DataSet/kohonenNetWeights.json', '../LuckyModels/temp/kohonenNetWeights.json')
    fs.writeFileSync('../LuckyModels/temp/readme.txt', resultText)
  }
}

const testStrategy = (kohonenCycle: number) => {
  console.log(`kohonen cycle ${kohonenCycle}, kerasCycle: 151`)
  execSync('./runModel.sh 2', { cwd: '../' })
  checkEvaluation()

  let i = 150
  while (i >= 0) {
    console.log(`kohonen cycle ${kohonenCycle}, kerasCycle: ${i}`)
    i--
    execSync('./runModel.sh 1', { cwd: '../' })
    checkEvaluation()
  }
}

let k = 20
while (k >= 0 ) {
  testStrategy(k)
  k--
}
