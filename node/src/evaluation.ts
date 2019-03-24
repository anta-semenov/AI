import { load } from './utils/file'
import * as fs from 'fs'
import { INPUT_DEEP } from './constants'
import { Instrument, InstrumentDayData, DayData } from './types'

const leverage = 20

const getDealResult = (amount: number, startPrice: number, closePrice: number, isSell = false) => {
  if (isSell) {
    return (amount * leverage) * (1 - closePrice / startPrice)
  } else {
    return (amount * leverage) * (closePrice / startPrice - 1)
  }
}

const getDealAmount = (deposit:  number, avgVol:  number, startPrice:  number, numberOfDeals:  number) => {
  const maxAmount = deposit / numberOfDeals
  const volAmount = deposit * 0.1 * startPrice / (avgVol * 1.2) / leverage
  const amount = Math.min(maxAmount, volAmount)
  return 50 * Math.trunc(amount / 50)
}

const logDeal = (result: number, deposit: number, amount: number, symbolDayData: InstrumentDayData, stopPrice: number, symbol: Instrument, closePrice: number, type: 'buy' | 'sell') => {
  const date = new Date(symbolDayData.date)
  const volatilityRate = ((symbolDayData.high - symbolDayData.low) / symbolDayData.avgVol).toFixed(2)
  const resultRate = Number((result * 100 / deposit).toFixed(0))
  if (resultRate > -10) {
    return
  }
  console.log(`${type} result: ${Math.trunc(result)}, depo: ${Math.trunc(deposit)}, symbol: ${symbol}, amount: ${Math.trunc(amount)}, openPrice: ${symbolDayData.open}, closePrice: ${symbolDayData.close}, stopPrice: ${stopPrice}, low: ${symbolDayData.low}, high: ${symbolDayData.high}`)
  console.log(`${type} result: ${Math.trunc(result)}, depo: ${Math.trunc(deposit)}, symbol: ${symbol}, resultRate: ${resultRate}, volRate: ${volatilityRate}, date: ${date}, amount: ${Math.trunc(amount)}, openPrice: ${symbolDayData.open}, closePrice: ${closePrice}, stopPrice: ${stopPrice}`)
}

const writeChartData = (chartData: Array<string[] | number[]>) => {
  let fileContent = 'window.dataSource = [\n'
  chartData.forEach((item) => {
    fileContent = `${fileContent}${JSON.stringify(item)},\n`
  })
  fileContent = `${fileContent}]`
  fs.writeFileSync('./graph/data.js', fileContent)
}

export const evaluateModel = () => {
  const predictions = JSON.parse(fs.readFileSync('../predictions.json').toString()) as number[][]
  const dayData = load('perDateData').TestData.slice(INPUT_DEEP) as DayData[]

  if ((predictions.length + 1) !== dayData.length) {
    throw Error(`dayData and predictions lengths aren't equal ${predictions.length}, ${dayData.length}`)
  }

  const startDeposit = 1000
  let deposit = startDeposit
  let totalDeals = 0
  let winDeals = 0
  let loseDeals = 0
  let maxDepo = startDeposit
  let minDropDownDepo = startDeposit
  let maxDropDownPercent = 0
  const chartData = [
    ['Deal', 'Deposit'],
    [`${totalDeals}`, deposit],
  ]

  predictions.forEach((predict: number[], predictIndex: number) => {
    const numberOfDeals = predict.reduce((res, value) => value > 0.7 ? res + 1 : res, 0)
    const dayDeposit = deposit
    // console.log('+++', dayDeposit, numberOfDeals);

    Instrument.all.forEach((symbol, symbolIndex) => {
      const symbolDayData = dayData[predictIndex][symbol]!

      const isBuy = predict[symbolIndex * 2] > 0.7
      const isSell = predict[symbolIndex * 2 + 1] > 0.7

      if (isBuy && isSell) {
        return
      } else if (isBuy) {
        totalDeals++
        const stopPrice = symbolDayData.open - symbolDayData.avgVol * 1.2
        const closePrice = stopPrice < symbolDayData.low ? symbolDayData.close : stopPrice
        const amount = getDealAmount(dayDeposit, symbolDayData.avgVol, symbolDayData.open, numberOfDeals)
        const result = getDealResult(amount, symbolDayData.open, closePrice)
        result > 0 ? loseDeals++ : winDeals++
        logDeal(result, deposit, amount, symbolDayData, stopPrice, symbol, closePrice, 'buy')
        deposit = deposit + result
        chartData.push([totalDeals, deposit])
      } else if (isSell) {
        totalDeals++
        const stopPrice = symbolDayData.open + symbolDayData.avgVol * 1.2
        const closePrice = stopPrice > symbolDayData.high ? symbolDayData.close : stopPrice
        const amount = getDealAmount(dayDeposit, symbolDayData.avgVol, symbolDayData.open, numberOfDeals)
        const result = getDealResult(amount, symbolDayData.open, closePrice, true)
        logDeal(result, deposit, amount, symbolDayData, stopPrice, symbol, closePrice, 'sell')
        result > 0 ? loseDeals++ : winDeals++
        deposit = deposit + result
        chartData.push([totalDeals, deposit])
      }
    })

    if (deposit <= 0) {
      throw Error('No money')
    } else if (deposit > maxDepo) {
      const dropDown = Number(((maxDepo - minDropDownDepo) * 100 / maxDepo).toFixed(2))
      maxDropDownPercent = Math.max(dropDown, maxDropDownPercent)
      maxDepo = deposit
      minDropDownDepo = deposit
    } else {
      minDropDownDepo = Math.min(minDropDownDepo, deposit)
    }
  })
  const dropDown = Number(((maxDepo - minDropDownDepo) * 100 / maxDepo).toFixed(2))
  maxDropDownPercent = Math.max(dropDown, maxDropDownPercent)

  console.log('End of evaluation')
  console.log(`depo: ${deposit}, %: ${deposit / startDeposit * 100}, maxDropDown: ${maxDropDownPercent}`)
  console.log(`total: ${totalDeals}, win: ${winDeals}, lose: ${loseDeals}`)
  writeChartData(chartData as any)
  fs.writeFileSync('./evaluationResult.json', JSON.stringify({
    depositRise: deposit / startDeposit,
    dropDown: maxDropDownPercent,
    totalDeals,
    winDeals,
    loseDeals,
  }))
}

evaluateModel()
