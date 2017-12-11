const fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  config = require('../config')

const authNum = config.checkers + 1,
  auths = {
    [config.password]: {
      userType: 'admin',
      isOnline: false
    }
  },
  outAuths = []

for (let i = 0; i < authNum; i++) {
  const authCode = uuid()
  auths[authCode] = {
    userType: 'checker',
    name: `00${i+1}`, 
    isOnline: false,
    unread: 0
  }
  outAuths.push({
    userType: 'checker',
    name: `00${i+1}`, 
    authCode: authCode
  })
}

fs.writeFileSync(path.join(__dirname, '../auths.json'), JSON.stringify({
  auths: outAuths
}, null, '\t'))

module.exports = auths
