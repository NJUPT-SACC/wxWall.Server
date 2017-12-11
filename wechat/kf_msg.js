const fetch = require('node-fetch')

const KFSendMsg = ({
  access_token,
  template
}) => {
  return new Promise((resolve, reject) => {
    const requestUrl =
      `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${access_token}`
    fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(template)
      })
      .then(res => res.json())
      .then(({
        errcode,
        errmsg
      }) => {
        if (errcode) {
          return reject({
            errcode,
            errmsg
          })
        }
        return resolve('OK!')
      }).catch(err => reject(err))
  })
}

module.exports = KFSendMsg
