const fetch = require('node-fetch'),
  redisClient = require('../model/redisClient')

const getUserInfo = ({
  access_token,
  openid,
  register = false
}) => {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(openid, (err, user) => {
      if (err) {
        return reject(err)
      }
      if (!user && !register) {
        return reject({
          errmsg: 'Not Registered'
        })
      }
      if (user) {
        return resolve(user)
      }
      const requestURL =
        `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${access_token}&openid=${openid}&lang=zh_CN`
      fetch(requestURL, {
          method: 'GET'
        })
        .then(res => res.json())
        .then(({
          errcode,
          errmsg,
          openid,
          nickname,
          headimgurl
        }) => {
          if (errcode) {
            return reject({
              errcode,
              errmsg
            })
          }
          redisClient.sadd('openid_list', openid, err => {
            if (err) {
              return reject(err)
            }
            // * 确认过了，即使中途这个人改了头像，这个头像链接也不会变
            redisClient.hmset(openid, [
              'nickname', nickname,
              'headimgurl', headimgurl,
              'passed', 0
            ], err => {
              if (err) {
                return reject(err)
              }
              return resolve({
                nickname: nickname,
                headimgurl: headimgurl,
                passed: 0
              })
            })
          })
        })
        .catch(err => reject(err))
    })
  })
}

module.exports = getUserInfo
