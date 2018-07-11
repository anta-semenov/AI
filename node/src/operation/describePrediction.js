import fs from 'fs'
import {symbols} from '../constants'

const leverage = 20

const getDealAmount = (deposit, avgVol, startPrice, numberOfDeals) => {
  const maxAmount = deposit / numberOfDeals
  const volAmount = deposit * 0.1 * startPrice / (avgVol * 1.2) / leverage
  return Math.min(maxAmount, volAmount)
}

const describePrediction = (args) => {
  const predictions = JSON.parse(fs.readFileSync('../OperatingData/prediction.json'))

  const numberOfDeals = predictions.reduce((res, value) => value > 0.7 ? res + 1 : res, 0)

  const deposit = Number(args[0]) || 0

  symbols.forEach((symbol, symbolIndex) => {
    const isBuy = predictions[symbolIndex * 2] > 0.7
    const isSell = predictions[symbolIndex * 2 + 1] > 0.7

    const dayData = JSON.parse(fs.readFileSync(`../OperatingData/${symbol}.json`)).dayData[0]

    if (isBuy && isSell) {
      return
    } else if (isBuy) {
      const amount = getDealAmount(deposit, dayData.avgVol, dayData.close, numberOfDeals)
      console.log(`${symbol}: buy ${amount}, slPoints: ${dayData.avgVol * 1.2}, `)
    } else if (isSell) {
      const amount = getDealAmount(deposit, dayData.avgVol, dayData.close, numberOfDeals)
      console.log(`${symbol}: sell ${amount}, slPoints: ${dayData.avgVol * 1.2}`)
    }
  })

}

describePrediction(process.argv.slice(2))
