const math = require('mathjs')

export const convolutionLayer = (input: number[][], filters: number[][], step: number): number[][] => {
  const inputSize = math.size(input)
  //create result matrix
  filters.forEach(filter => {
    const filterSize = math.size(filter)
    let filterResult
    if (filterSize.length === 1) {
      // input is number of channels

    } else if (filterSize === 2) {
      // input is 2D matrix
      const stepSize = filterSize[0] / 2
      const steps = Math.trunc(inputSize[0] / (filterSize[0] / 2))
      filterResult = []
      let step = 0
      while (step <= steps) {
        const subInput = input.slice(step * stepSize, step * stepSize + filterSize[0])
        filterResult.push(math.dot(subInput, filter))
        step++
      }
    }
    // get size of input matrix (check mathjs docs, do they have this function or not)
    // iterate through size of the matrix with step
    // depending on filter dimension we should take different submatrix from input
    // input could be both 2-dimensional data or multiple channels of 1-dimensional data

    // add filter output to result matrix
  })
}

const test = [
  [1, 2, 3, 4],
  [2, 2, 3, 4],
  [3, 2, 3, 4],
  [4, 2, 3, 4],
  [5, 2, 3, 4],
  [6, 2, 3, 4],
  [7, 2, 3, 4],
  [8, 2, 3, 4],
  [9, 2, 3, 4],
  [10, 2, 3, 4],
  [11, 2, 3, 4],
  [12, 2, 3, 4],
  [13, 2, 3, 4]
]

const testFilter = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1]
]

const testSize = math.size(test)
const subset = test.slice(0, 4)
const dot = math.dot(math.reshape(subset, [16]), math.reshape(testFilter, [16]))
dot
