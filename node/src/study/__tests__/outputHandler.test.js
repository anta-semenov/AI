import {outputHandlerCreator} from '../outputHandler'

describe('OutputHandler', () => {
  it('Should initialize with zero values', () => {
    const symbols = ['test1', 'test2']
    const outputHandler = outputHandlerCreator(symbols)

    expect(outputHandler.getSymbolTradeStatus('test1')).toBe(0)
    expect(outputHandler.getSymbolTradeStatus('test2')).toBe(0)
    expect(outputHandler.getScore()).toBe(0)
  })

  describe('buy position', () => {
    it('Should open buy position correctly', () => {
      const output = [1, 0, 0, 0]
      const symbols = ['test1', 'test2']
      const priceData = {test1: 1, test2: 3}

      const outputHandler = outputHandlerCreator(symbols)
      outputHandler.handle(output, priceData)
      expect(outputHandler.getSymbolTradeStatus('test1')).toBe(1)
      expect(outputHandler.getSymbolTradeStatus('test2')).toBe(0)
    })

    it('Should close buy position and update score when lose signal', () => {
      const output1 = [1, 0, 0, 0]
      const output2 = [0, 0, 0, 0]
      const symbols = ['test1', 'test2']
      const priceData1 = {test1: 1, test2: 3}
      const priceData2 = {test1: 3, test2: 3}

      const outputHandler = outputHandlerCreator(symbols)
      outputHandler.handle(output1, priceData1)
      expect(outputHandler.getSymbolTradeStatus('test1')).toBe(1)

      outputHandler.handle(output2, priceData2)
      expect(outputHandler.getSymbolTradeStatus('test1')).toBe(0)
      expect(outputHandler.getScore()).toBe(2)
    })

    it('Should close buy position and update score when the double signal occurs', () => {
      const output1 = [1, 0, 0, 0]
      const output2 = [1, 1, 0, 0]
      const symbols = ['test1', 'test2']
      const priceData1 = {test1: 1, test2: 3}
      const priceData2 = {test1: 3, test2: 3}

      const outputHandler = outputHandlerCreator(symbols)
      outputHandler.handle(output1, priceData1)
      expect(outputHandler.getSymbolTradeStatus('test1')).toBe(1)

      outputHandler.handle(output2, priceData2)
      expect(outputHandler.getSymbolTradeStatus('test1')).toBe(0)
      expect(outputHandler.getScore()).toBe(2)
    })
  })

  describe('Sell position', () => {
    it('Should open sell position correctly', () => {
      const output = [0, 0, 0, 1]
      const symbols = ['test1', 'test2']
      const priceData = {test1: 1, test2: 3}

      const outputHandler = outputHandlerCreator(symbols)
      outputHandler.handle(output, priceData)
      expect(outputHandler.getSymbolTradeStatus('test1')).toBe(0)
      expect(outputHandler.getSymbolTradeStatus('test2')).toBe(-1)
    })

    it('Should close sell position and update score when lose signal', () => {
      const output1 = [0, 0, 0, 1]
      const output2 = [0, 0, 0, 0]
      const symbols = ['test1', 'test2']
      const priceData1 = {test1: 1, test2: 3}
      const priceData2 = {test1: 3, test2: 5}

      const outputHandler = outputHandlerCreator(symbols)
      outputHandler.handle(output1, priceData1)
      expect(outputHandler.getSymbolTradeStatus('test2')).toBe(-1)

      outputHandler.handle(output2, priceData2)
      expect(outputHandler.getSymbolTradeStatus('test2')).toBe(0)
      expect(outputHandler.getScore()).toBe(-0.4)
    })

    it('Should close buy position and update score when the double signal occurs', () => {
      const output1 = [0, 0, 0, 1]
      const output2 = [0, 0, 1, 1]
      const symbols = ['test1', 'test2']
      const priceData1 = {test1: 1, test2: 3}
      const priceData2 = {test1: 3, test2: 5}

      const outputHandler = outputHandlerCreator(symbols)
      outputHandler.handle(output1, priceData1)
      expect(outputHandler.getSymbolTradeStatus('test2')).toBe(-1)

      outputHandler.handle(output2, priceData2)
      expect(outputHandler.getSymbolTradeStatus('test2')).toBe(0)
      expect(outputHandler.getScore()).toBe(-0.4)
    })
  })

  it('Should close positions for many instrument and update score accumulatively', () => {
    const output1 = [1, 0, 0, 1]
    const output2 = [0, 0, 1, 1]
    const symbols = ['test1', 'test2']
    const priceData1 = {test1: 1, test2: 3}
    const priceData2 = {test1: 3, test2: 1}

    const outputHandler = outputHandlerCreator(symbols)
    outputHandler.handle(output1, priceData1)
    outputHandler.handle(output2, priceData2)
    expect(outputHandler.getSymbolTradeStatus('test1')).toBe(0)
    expect(outputHandler.getSymbolTradeStatus('test2')).toBe(0)
    expect(outputHandler.getScore()).toBe(4)
  })
})
