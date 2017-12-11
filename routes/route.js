const express = require('express'),
    config = require('../config'),
    wechat = require('../wechat'),
    users = require('../model/users'),
    redisClient = require('../model/redisClient')

//初始化待上墙数据库
redisClient.hmset('waitShowMessages', ['MsgId', 'PLEASEDONTDELETETHISMESSAGE'], (err) => {
    if (err) {
        console.log(err)
    }
})
//初始化待审核数据库
redisClient.hmset('waitCheckMessages', ['MsgId', 'PLEASEDONTDELETETHISMESSAGE'], (err) => {
    if (err) {
        console.log(err)
    }
})

router = express.Router()

//登陆接口
router.post('/login', (req, res, next) => {
    let { authcode } = req.body
    if (!users[authcode]) {
        res.json({
            status_code: 0
        })
        return
    }
    users[authcode].isOnline = true
    if (users[authcode].userType === 'checker') {
        req.session.authcode = authcode;
        req.session.save();
        res.json({
            status_code: 1
        })
        return
    }
    if (users[authcode].userType === 'admin') {
        req.session.authcode = authcode
        req.session.save()
        res.json({
            status_code: 2
        })
        return
    }


})

//审核页面轮询消息
router.get('/checkerGetMessage', (req, res, next) => {
    if (!req.session.authcode) {
        res.json({})
        return
    }
    //waitCheckMessages的hash里获取所有提交上消息的msgid和content
    redisClient.hgetall('waitCheckMessages', (err, response) => {
        if (err) {
            return next(err)
        }
        redisClient.hlen('waitCheckMessages', (err, len) => {
            if (err) {
                return next(err)
            }
            //因为删除hash里所有数据后，整个hash段都会被删除，所以保留第一个数据
            if (len === 1) {
                res.json({})
            } else {
                let keyName = []
                for (let i in response) {
                    keyName.push(i)
                }
                let MsgId = keyName[1]
                let content = response[keyName[1]]
                if(MsgId !=='MsgId'){
                    res.json({
                        status_code: 1,
                        MsgId: MsgId,
                        content: content
                    })
                }else {
                    res.json({
                    })
                }

                
                //删除waitCheakMessages里的对应数据
                redisClient.hdel('waitCheckMessages', MsgId, (err, result) => {
                    if (err) {
                        return next(err)
                    }
                })
            }
        })
    })
})

//提交审核通过的消息
router.post('/checkerPostMessage', (req, res, next) => {
    if (!req.session.authcode) {
        res.json({
            status_code: 0,
        })
        return
    }
    let MsgId = req.body.MsgId

    //把审核通过的消息放入waitShowMessages
    redisClient.hmset('waitShowMessages', [
        `${MsgId}`, `${MsgId}`
    ], (err) => {
        if (err) {
            return next(err)
        }
        //获取审核通过消息对应的openid用于抽奖
        redisClient.hgetall(`MSG-${MsgId}`, (err, messages) => {
            if (err) {
                return next(err)
            }
            if(!messages){
                const error = new Error('Not found!')
                error.status = 404
                return next(err)
            }
            let openid = messages['openid']
            //放入lotteryMessages里用于抽奖
            redisClient.hmset('lotteryMessages', [`${openid}`, `${openid}`], (err) => {
                if (err) {
                    return next(err)
                }
            })
        })

        //把所有审核通过的信息放入统计数据库
        redisClient.hmset('allCheckMessages', [
            `${MsgId}`, `${MsgId}`
        ], (err, res) => {
            if (err) {
                return next(err)
            }
        })
        res.json({
            status_code: 1
        })
    })
})

//展示墙轮询待上墙数据
router.get('/wallGetMessage', (req, res, next) => {
    redisClient.hgetall('waitShowMessages', (err, response) => {
        if (err) {
            return next(err)
        }

        redisClient.hlen('waitShowMessages', (err, len) => {
            if (err) {
                return next(err)
            }
            if (len === 1) {
                res.json({})
            } else {
                let MsgIdArray = []
                for (let i in response) {
                    MsgIdArray.push(i)
                }
                let MsgId = MsgIdArray[1]

                redisClient.hgetall(`MSG-${MsgId}`, (err, messages) => {
                    if (err) {
                        return next(err)
                    }

                    let content = messages['content']
                    let openid = messages['openid']
                    //根据openid获取信息
                    redisClient.hgetall(`${openid}`, (err, messages_openid) => {
                        if (err) {
                            return next(err)
                        }
                        let nickname = messages_openid['nickname']
                        let headimgurl = messages_openid['headimgurl']
                        res.json({
                            content: content,
                            nickname: nickname,
                            headimgurl: headimgurl,
                            MsgId:MsgId
                        })
                    })
                })
                redisClient.hdel('waitShowMessages', MsgId, (err, res) => {
                    if (err) {
                        return next(err)
                    }
                })
            }
        })
    })
})

const getInfo = (openid) => {
    return new Promise((resolve, reject) => {
        redisClient.hgetall(`${openid}`, (err, messages) => {
            if (err) {
                return reject(err)
            }
            let nickname = messages['nickname'],
                headimgurl = messages['headimgurl']
            return resolve({
                nickname: nickname,
                headimgurl: headimgurl
            })
        })
    })
}

router.get('/wallGetWinners', (req, res, next) => {
    redisClient.hgetall('lotteryMessages', async (err, openids) => {
        if (err) {
            return next(err)
        }
        let allOpenid = []
        let allUsers = []   //返回所有能抽奖的用户
        try {
            for (let openid in openids) {
                const userInfo = await getInfo(openid)
                allUsers.push(userInfo)
            }
            return res.json(allUsers)
        } catch (err) {
            return next(err)
        }

    })
})





module.exports = router