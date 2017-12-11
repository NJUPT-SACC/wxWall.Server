const _ = require('lodash')

const uppercaseLetters = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ],
  lowercaseLetters = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
    't', 'u', 'v', 'w', 'x', 'y', 'z'
  ],
  numbers = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ]

const combined = _.concat([], uppercaseLetters, lowercaseLetters, numbers)

const genRandomStr = len => {
  let retStr = ''
  while (len) {
    const randKey = _.random(0, combined.length - 1)
    retStr += combined[randKey]
    len--
  }
  return retStr
}

module.exports = genRandomStr
