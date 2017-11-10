// const convertData = require('./utils/dataConvertation')
// const math = require('mathjs')
const fs = require('fs')
const path = require('path')

// math.config({number: 'BigNumber'})

// convertData()

const test1 = []
const test2 = []

let i = 0

while (i < 6700) {
  test1[i] = Math.trunc(Math.random() * 1000000000)
  test2[i] = Math.trunc(Math.random() * 1000000000)
  i++
}

console.log('start');
const start = Date.now()

i = 0
let result = 0
while (i < 1000) {
  i++
  result = test1.reduce((sum, item, index) => sum + item * test2[index], 0)
}

const time = Date.now() - start

console.log(`time: ${(Date.now() - start)/1000} ms`, result);
