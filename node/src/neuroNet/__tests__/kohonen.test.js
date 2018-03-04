import {kohonen, kohonenConvolutionLayer} from '../kohonen'

describe('Kohonen Layer tests', () => {
  describe('Kohonen', () => {
    it('Should return correct winner', () => {
      const input = [1, 2, 3, 4, 5]

      const filters = [
        [1, 2, 3, 4, 4],
        [1, 4, 4, 5, 2],
        [1, 3, 2, 4, 5]
      ]

      expect(kohonen(input, filters)).toBe(0)
    })
  })

  describe('Kohonen Layer', () => {
    it('Should move filter on input', () => {
      const input = [
        [1, 0, 0, 0],
        [1, 2, 0, 0],
        [1, 2, 3, 0],
        [1, 2, 3, 4]
      ]

      const filters = [
        [
          [1, 2, 3, 4],
          [4, 3, 2, 1]
        ],
        [
          [1, 0, 0, 1],
          [1, 2, 0, 1]
        ],
        [
          [1, 2, 0, 0],
          [0, 2, 3, 1]
        ]
      ]

      const expectResult = [1, 2, 2]

      expect(kohonenConvolutionLayer(input, filters, 1)).toEqual(expectResult)
    })
  })
})
