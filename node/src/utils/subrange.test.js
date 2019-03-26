import {subrange} from './subrange'

describe('Subrange', () => {
  it('Should fail if index dimensions are not the same', () => {
    const matrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ]

    expect(() => {
      subrange(matrix, [1, 1], [3])
    }).toThrow()
  })

  it('Should fail if start index is bigger then end index', () => {
    const matrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ]

    expect(() => {
      subrange(matrix, [3, 1], [2, 3])
    }).toThrow()
  })

  it('Should fail if matrix dimension less then index dimension', () => {
    const matrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ]

    expect(() => {
      subrange(matrix, [1, 1, 1], [3, 3, 3])
    }).toThrow()
  })

  it('Should return correct subrange for 2 dimensional matrix', () => {
    const matrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ]

    const result = [
      [6, 7, 8],
      [10, 11, 12]
    ]

    expect(subrange(matrix, [1, 1], [2, 3])).toEqual(result)
  })

  it('Should return correct subrange if index dimension less then matrix dimension', () => {
    const matrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ]

    const result = [
      [5, 6, 7, 8],
      [9, 10, 11, 12]
    ]

    expect(subrange(matrix, [1], [2])).toEqual(result)
  })

  it('Should correct for 3 dimansional matrix', () => {
    const matrix = [
      [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ],
      [
        [17, 18, 19, 20],
        [21, 22, 23, 24],
        [25, 26, 27, 28],
        [29, 30, 31, 32]
      ],
      [
        [33, 34, 35, 36],
        [37, 38, 39, 40],
        [41, 42, 43, 44],
        [45, 46, 47, 48]
      ],
      [
        [49, 50, 51, 52],
        [53, 54, 55, 56],
        [57, 58, 59, 60],
        [61, 62, 63, 64]
      ]
    ]

    const result = [
      [
        [22, 23],
        [26, 27]
      ],
      [
        [38, 39],
        [42, 43]
      ],
      [
        [54, 55],
        [58, 59]
      ]
    ]

    expect(subrange(matrix, [1, 1, 1], [3, 2, 2])).toEqual(result)
  })
})
