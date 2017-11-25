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

    const expectResult = [[
      [3, 0, 0],
      [3, 5, 0],
      [3, 5, 7]
    ]]

    expect(convolutionLayer(input, [filter], 1)).toEqual(expectResult)
  })

  it('Should work correctly for 3 dimension matrix with on full size filter dimension', () => {
    const input = [
      [[1, 1, 1], [0, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[1, 1, 2], [2, 2, 1], [0, 0, 0], [0, 1, 1]],
      [[1, 1, 1], [2, 2, 2], [3, 3, 3], [0, 1, 1]],
      [[1, 2, 3], [2, 3, 4], [3, 1, 0], [4, 3, 2]]
    ]

    const filter = [
      [[1, 0, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1]]
    ]

    const expectResult = [[
      [8, 1, 3],
      [11, 12, 3],
      [13, 11, 16]
    ]]

    expect(convolutionLayer(input, [filter], 1)).toEqual(expectResult)
  })

  it('Should work with multi tests and full size filter dimension', () => {
    const input = [
      [1, 0, 0, 0],
      [1, 2, 0, 0],
      [1, 2, 3, 0],
      [1, 2, 3, 4]
    ]

    const filters = [
      [
        [1, 0, 1, 0],
        [0, 1, 0, 1]
      ],
      [
        [1, 1, 1, 1],
        [0, 0, 0, 0]
      ],
      [
        [1, 1, 0, 0],
        [0, 0, 1, 1]
      ],
    ]

    const expectResult = [
      [3, 3, 10],
      [1 ,3, 6],
      [1, 6, 10]
    ]
  })
})
