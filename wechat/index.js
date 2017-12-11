const _ = require('lodash'),
  sha1 = require('sha1'),
  config = require('../config'),
  xml2json = require('xml2json'),
  KFSendMsg = require('./kf_msg'),
  KFTEMPLATE = require('./kf_template'),
  getUserInfo = require('./get_userinfo'),
  WXBizMsgCrypt = require('wechat-crypto'),
  getAccessToken = require('./get_accesstoken')

const _Wechat = function (appID, appsecret, Token, EncodingAESKey) {
  if (!appID) {
    throw new Error('The `appID` must be provied!')
  }
  if (!appsecret) {
    throw new Error('The `appsecret` must be provied!')
  }
  if (!Token) {
    throw new Error('The `Token` must be provied!')
  }
  this.appID = appID
  this.appsecret = appsecret
  this.Token = Token
  this.EncodingAESKey = EncodingAESKey
}

_Wechat.prototype.Cipher = function () {
  const self = this
  return function (req, res, next) {
    const {
      msg_signature,
      timestamp,
      nonce
    } = req.query
    if (!msg_signature || !timestamp || !nonce) {
      const err = new Error('Signature missing!')
      err.name = 'SIGNATURE_ERROR'
      err.status = 401
      return next && next(err)
    }
    self.WXCrypt = new WXBizMsgCrypt(self.Token, self.EncodingAESKey, self.appID)
    let postData = ''
    req.on('data', chunk => {
      postData += chunk
    })
    req.on('error', (err) => {
      return next && next(err)
    })
    req.on('end', () => {
      try {
        // * 解析在某些情况下还是可以hack的
        const WxMsg = JSON.parse(xml2json.toJson(postData))['xml']
        if (!WxMsg) {
          const err = new Error('Can\'t parse the body correctly!')
          err.name = 'XMLPARSE_ERROR'
          err.status = '401'
          return next && next(err)
        }
        const {
          Encrypt
        } = WxMsg,
        DecryptedMsg = xml2json.toJson(self.WXCrypt.decrypt(Encrypt).message)['xml'],
          signature = self.WXCrypt.getSignature(timestamp, nonce, Encrypt)
        if (signature !== msg_signature) {
          const err = new Error('Signature not match!')
          err.name = 'SIGNATURE_ERROR'
          err.status = 401
          return next && next(err)
        }
        if (!DecryptedMsg) {
          const err = new Error('Can\'t parse the body correctly!')
          err.name = 'XMLPARSE_ERROR'
          err.status = 401
          return next && next(err)
        }
        res.send('')
        req.$WxMsg = DecryptedMsg
        return next && next(null)
      } catch (e) {
        const err = new Error('Body not Acceptable')
        err.name = 'XMLPARSE_ERROR'
        err.status = 406
        return next && next(err)
      }
    })
  }
}

_Wechat.prototype.Plain = function () {
  return function (req, res, next) {
    const {
      signature,
      timestamp,
      nonce
    } = req.query
    if (!signature || !timestamp || !nonce) {
      const err = new Error('Signature missing!')
      err.name = 'SIGNATURE_ERROR'
      err.status = 401
      return next && next(err)
    }
    const sortedStr = _.join([config.Token, timestamp, nonce].sort(), ''),
      encryptedStr = sha1(sortedStr)
    if (signature !== encryptedStr) {
      const err = new Error('Signature invalid!')
      err.name = 'SIGNATURE_ERROR'
      err.status = 401
      return next && next(err)
    }
    let postData = ''
    req.on('data', chunk => {
      postData += chunk
    })
    req.on('error', err => {
      return next && next(err)
    })
    req.on('end', () => {
      try {
        // * 解析在某些情况下还是可以hack的
        const WxMsg = JSON.parse(xml2json.toJson(postData))['xml']
        if (!WxMsg) {
          const err = new Error('Body not Acceptable')
          err.name = 'XMLPARSE_ERROR'
          err.status = 401
          return next && next(err)
        }
        req.$WxMsg = WxMsg
        res.send('')
        return next && next(null)
      } catch (e) {
        const err = new Error('Body not Acceptable')
        err.name = 'XMLPARSE_ERROR'
        err.status = 406
        return next && next(err)
      }
    })
  }
}

_Wechat.prototype.Xml2Json = function (encrypt = false) {
  if (encrypt) {
    return this.Cipher()
  }
  return this.Plain()
}

_Wechat.prototype.getUserInfo = function (openid, register) {
  return new Promise((resolve, reject) => {
    getAccessToken({
      appID: this.appID,
      appsecret: this.appsecret
    }).then(access_token => {
      getUserInfo({
          access_token: access_token,
          openid: openid,
          register: register || false
        })
        .then(uid => resolve(uid))
        .catch(err => reject(err))
    }).catch(err => reject(err))
  })
}

_Wechat.prototype.KF_SendMsg = function (openid, template, arg) {
  return new Promise((resolve, reject) => {
    getAccessToken({
      appID: this.appID,
      appsecret: this.appsecret
    }).then(access_token => {
      KFSendMsg({
          access_token: access_token,
          template: KFTEMPLATE[template](openid, arg)
        })
        .then(() => resolve('OK!'))
        .catch(err => reject(err))
    }).catch(err => reject(err))
  })
}

_Wechat.prototype.KF_TEMPLATES = {
  AFTER_END: 'AFTER_END',
  MSG_PASSED: 'MSG_PASSED',
  FORMART_ERR: 'FORMART_ERR',
  NOT_REGISTER: 'NOT_REGISTER',
  SEND_SUCCESS: 'SEND_SUCCESS',
  BEFORE_START: 'BEFORE_START',
  WIN_THE_PRIZE: 'WIN_THE_PRIZE',
  MSG_NOT_PASSED: 'MSG_NOT_PASSED',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS'
}

const Wechat = new _Wechat(
  config.appID,
  config.appsecret,
  config.Token,
  config.EncodingAESKey
)

module.exports = Wechat
