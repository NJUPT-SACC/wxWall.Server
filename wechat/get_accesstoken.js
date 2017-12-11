const fetch = require('node-fetch'),
  redisClient = require('../model/redisClient')

const getAccessToken = ({
  appID,
  appsecret
}) => {
  return new Promise((resolve, reject) => {
    redisClient.get('access_token', (err, accessToken) => {
      if (err) {
        return reject(err)
      }
      if (accessToken) {
        return resolve(accessToken)
      }
      const requestURL =
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
      fetch(requestURL, {
          method: 'GET'
        })
        .then(res => res.json())
        .then(({
          errcode,
          errmsg,
          access_token,
          expires_in
        }) => {
          if (errcode) {
            return reject({
              errcode,
              errmsg
            })
          }
          redisClient.set('access_token', access_token, 'EX',
            expires_in,
            err => {
              if (err) {
                return reject(err)
              }
              return resolve(access_token)
            })
        }).catch(err => reject(err))
    })
  })
}

module.exports = getAccessToken
