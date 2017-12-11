const _ = require('lodash'),
  sha1 = require('sha1'),
  express = require('express'),
  config = require('../config'),
  wechat = require('../wechat'),
  redisClient = require('../model/redisClient'),
  tickRequest = require('../util/tickRequest')

const {
  Token,
  EncodingAESKey,
  register_words,
  mark,
  starttime
} = config,
router = express.Router()

const dateReg = new RegExp(/\d{4}(-|\/|.)\d{1,2}\1\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}/)

if (!_.isString(starttime) || !dateReg.test(starttime)) {
  throw new Error('`starttime` must be provided in the correct format!')
}

const startTime = (new Date(starttime)).getTime()

if (_.isNaN(startTime)) {
  throw new Error('`starttime` must be provided in the correct format!')
}

if (!Token) {
  throw new Error('The `Token` must be provided!')
}

router.get('/connect', tickRequest, (req, res, next) => {
  const {
    signature,
    timestamp,
    nonce,
    echostr
  } = req.query
  if (!signature || !timestamp || !nonce || !echostr) {
    res.status(401)
    return res.send('Opps!')
  }
  const sortedStr = _.join([Token, timestamp, nonce].sort(), ''),
    encryptedStr = sha1(sortedStr)
  if (signature !== encryptedStr) {
    res.status(401)
    return res.send('Opps!')
  }
  return res.send(echostr)
})

router.post('/connect', tickRequest, (req, res, next) => {
  wechat.Xml2Json(_.isString(EncodingAESKey) && EncodingAESKey)(req, res, err => {
    if (err) {
      return next(err)
    }
    if (!req.$WxMsg) {
      return
    }
    const {
      $WxMsg
    } = req, {
      MsgId,
      MsgType,
      Content: _content,
      FromUserName: openid
    } = $WxMsg
    const Content = _.replace(_content, config.mark, '').trim()
    if (MsgType !== 'text' || !_.startsWith(_content, mark) || !Content) {
      return wechat.KF_SendMsg(openid, wechat.KF_TEMPLATES.FORMART_ERR)
    }
    const NOW = _.now()
    if (NOW - startTime < 0 && Content !== register_words) {
      if (NOW - startTime < 0) {
        return wechat.KF_SendMsg(openid, wechat.KF_TEMPLATES.BEFORE_START)
          .catch(err => console.error(err))
      }
    }
    wechat.getUserInfo(openid, Content === register_words)
      .then(userInfo => {
        if (Content === register_words) {
          return wechat.KF_SendMsg(openid, wechat.KF_TEMPLATES.REGISTER_SUCCESS)
            .catch(err => console.error(err))
        } else {

          //把信息放入待审核库
          redisClient.hmset('waitCheckMessages',[
            `${MsgId}`,Content
          ],(err)={
            if(err){
              return next(err)
            }
          })
          //把来的信息放入统计数据库
          redisClient.hmset('allMessage',[
            `${MsgId}`,Content
          ],(err)={
            if(err){
              return next(err)
            }
          })
          redisClient.hmset(`MSG-${MsgId}`, [
            'openid', openid,
            'content', Content
          ], err => {
            if (err) {
              return next(err)
            }
            redisClient.publish('MSG@IN', `MSG-${MsgId}`, () => {
              return wechat.KF_SendMsg(openid, wechat.KF_TEMPLATES.SEND_SUCCESS, Content)
            })
          })

        }
      })
      .catch(err => {
        return wechat.KF_SendMsg(openid, wechat.KF_TEMPLATES.NOT_REGISTER)
          .catch(err =>  next(err))
      })
  })
})

module.exports = router
