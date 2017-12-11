module.exports = {
  // * 微信公众平台appID
  appID: 'wx****************',
  // * 微信公众平台appsecret
  appsecret: '********************************',
  // * 验证Token
  Token: '************',
  // * 是否加密模式，不加密则为空字符串
  EncodingAESKey: '',
  // * 服务器根路径
  serverURL: 'http://127.0.0.1:3000/',
  // * redis 数据库设置
  redisdb: {
    host: '127.0.0.1',
    port: 6379,
    password: '********************************'
  },
  // * 验证session用的
  sessionsecret: '********************************',
  // * 展示页面密码
  password: '********************************',
  // * 消息标记
  mark: '$',
  // * mark + register_words = 注册标记
  register_words: '我要上墙',
  // * 开始时间 必填 [年-月-日 时:分:秒]
  starttime: '2017-10-12 10:33:16',
  // * 结束时间 非必填 [年-月-日 时:分:秒]
  endtime: null,
  // * 审核人数
  checkers: 2,
  // * 服务端口
  port: 3000
}
