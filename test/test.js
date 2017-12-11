// const redis = require('redis'),
// config = require('../config'),
//   getAccessToken = require('../wechat/get_accesstoken'),
//   getUserinfo = require('../wechat/get_userinfo')

// const rediscfg = config.redisdb,
//   redisClient = redis.createClient(rediscfg)

// redisClient.on('ready', async() => {
//   try {
//     const access_token = await getAccessToken({
//         appID: config.appID,
//         appsecret: config.appsecret,
//         redisClient: redisClient
//       }),
//       userinfo = await getUserinfo({
//         access_token: access_token,
//         openid: 'o6_bmjrPTlm6_2sgVt7hMZOPfL2M',
//         redisClient: redisClient
//       })
//     console.log(userinfo)
//   } catch (err) {
//     console.log(err)
//   }

// })
// const genRand = require('../util/randomStr')

// console.log(genRand(32))

var xml2json = require('xml2json');

const text =  `
<xml>
<ToUserName><![CDATA[toUser]]></ToUserName>
<FromUserName><![CDATA[fromUser]]></FromUserName>
<CreateTime>1348831860</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[this is a test]]></Content>
<MsgId>1234567890123456</MsgId>
</xml>
`
console.log(xml2json.toJson(text))