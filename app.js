const _ = require('lodash'),
  path = require('path'),
  http = require('http'),
  redis = require('redis'),
  logger = require('morgan'),
  events = require('events'),
  express = require('express'),
  config = require('./config'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  redisClient = redis.createClient(config.redisdb)
  
// * express appication
const app = express()
 
const wxconnect = require('./routes/wxconnect')
const route = require('./routes/route')


// app.use(require('cors')(
//   {
//     origin:'http://localhost:8080',
//     credentials:true
//   }))
app.use(logger('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './public')))

const SESSION = session({
  secret: config.sessionsecret,
  resave: true,
  saveUninitialized: true,
  name: 'jsessionID'
})

app.use(cookieParser(config.sessionsecret))
app.use(SESSION)

app.use('/wx', wxconnect)
app.use('/',route)

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  return next(err)
})

app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status)
  return res.json({
    code: status,
    message: err.message
  })
})

// * http server
const server = http.createServer(app),
  {
    port: _port
  } = config,
  port = _.parseInt(_port) || 3000

server.listen(port)
server.on('listening', () => {
  console.info(`Listening on port ${port}.`)
})

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port

  switch (error.code) {
    case 'EACCES':
      {
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
      }
    case 'EADDRINUSE':
      {
        console.error(bind + ' is already in use')
        process.exit(1)
        break
      }
    default:
      {
        throw error
      }
  }
})

