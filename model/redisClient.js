const redis = require('redis'),
  config = require('../config')

// ? 这个文件就只是建个RedisClient？
const redisClient = redis.createClient(config.redisdb)

redisClient.on('ready', () => {
  console.info(`Redis conneted to ${config.redisdb.host} on port ${config.redisdb.port}.`)
})

module.exports = redisClient
