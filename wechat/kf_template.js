const config = require('../config'),
  _ = require('lodash')

const BEFORE_START = openid => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: '微信墙暂时还没有开放！'
  }
})

const AFTER_END = openid => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: '微信墙已经关闭了！'
  }
})

const REGISTER_SUCCESS = openid => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: '您已注册成功！'
  }
})

const NOT_REGISTER = openid => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: `您未注册，发送\`${config.mark}${config.register_words}\`即可注册！`
  }
})

const FORMART_ERR = openid => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: `消息格式不正确，请以\`${config.mark}\`作为消息开头，并只支持文本消息！`
  }
})

const SEND_SUCCESS = (openid, msg_content) => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: `您的消息\`${_.unescape(msg_content)}\`已成功收到，正在等待审核！`
  }
})

const MSG_PASSED = (openid, msg_content) => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: `您的消息\`${_.unescape(msg_content)}\`，审核通过！`
  }
})

const MSG_NOT_PASSED = (openid, msg_content) => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: `您的消息\`${_.unescape(msg_content)}\`，审核未通过，请斟酌信息内容。`
  }
})

const WIN_THE_PRIZE = (openid, degree) => ({
  touser: openid,
  msgtype: 'text',
  text: {
    content: `恭喜您中的\`${degree}等奖\`，请遵从安排领奖！`
  }
})

module.exports = {
  AFTER_END: AFTER_END,
  MSG_PASSED: MSG_PASSED,
  FORMART_ERR: FORMART_ERR,
  NOT_REGISTER: NOT_REGISTER,
  SEND_SUCCESS: SEND_SUCCESS,
  BEFORE_START: BEFORE_START,
  WIN_THE_PRIZE: WIN_THE_PRIZE,
  MSG_NOT_PASSED: MSG_NOT_PASSED,
  REGISTER_SUCCESS: REGISTER_SUCCESS
}
