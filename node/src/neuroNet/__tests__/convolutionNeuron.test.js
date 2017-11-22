import {convolutionLayer} from '../convolutionNeuron'

describe('Convolution Layer Tests', () => {
  it('Should work correctly for 2 dimension matrix with one filter', () => {
    const input = [
      [1, 0, 0, 0],
      [1, 2, 0, 0],
      [1, 2, 3, 0],
      [1, 2, 3, 4]
    ]

    const filter = [
      [1, 0],
      [0, 1]
    ]

    const expectResult = [
      [3, 0, 0],
      [3, 5, 0],
      [3, 5, 7]
    ]

    expect(convolutionLayer(input, filter, 1)).toEqual(expectResult)
  })
})
