const redisClient = require('../model/redisClient')

const tickRequest = (req, res, next) => {
  redisClient.publish('TICK_REQUEST', 'TICK', (err) => {
    next()
  })
}

module.exports = tickRequest
