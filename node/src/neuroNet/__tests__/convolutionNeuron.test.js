import * as math from 'mathjs'
import {convolutionLayer, convolutionLayerCreator} from '../convolutionNeuron'

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

  it('Should work with multi filters and full size filter dimension', () => {
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

    expect(convolutionLayer(input, filters, 1)).toEqual(expectResult)
  })

  it('Should work with gorizontal movements', () => {
    const input = [
      [1, 0, 0, 0],
      [1, 2, 0, 0],
      [1, 2, 3, 0],
      [1, 2, 3, 4]
    ]

    const filter = [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 0]
    ]

    const expectResult = [[6, 5, 3]]

    expect(convolutionLayer(input, [filter], 1)).toEqual(expectResult)
  })

  it('Should work with gorizontal movements and multi filters', () => {
    const input = [
      [1, 0, 0, 0],
      [1, 2, 0, 0],
      [1, 2, 3, 0],
      [1, 2, 3, 4]
    ]

    const filters = [
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [0, 0]
      ],
      [
        [0, 1],
        [1, 0],
        [0, 0],
        [1, 1]
      ]
    ]

    const expectResult = [
      [6, 5, 3],
      [4, 7, 7]
    ]

    expect(convolutionLayer(input, filters, 1)).toEqual(expectResult)
  })

  describe('Layer creator', () => {
    it('should create corect layer', () => {
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

      const dna = [0, 1, 2, 3, 4, 5, ...math.reshape(filters, [24]), 56, 78, 89]

      const creatorResult = convolutionLayerCreator(5, dna, {size: [3, 2, 4], step: 1})

      expect(dna[creatorResult.dnaIndex + 1]).toEqual(56)
      expect(creatorResult.layer.calculate(input)).toEqual(expectResult)
    })
  })
})
