require('dotenv').config();
const express = require('express')
const http = require('http')
const path = require('path')
const bodyParser = require('body-parser')
const socketIo = require('socket.io')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackConfig = require('../../webpack.config.js')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const port = process.env.PORT || 3000

// serves our html files out of public
app.use(express.static(path.join(__dirname, '/index.html')))
console.log(__dirname);
app.use(webpackDevMiddleware(webpack(webpackConfig)))
app.use(bodyParser.urlencoded({ extended: false }))

app.post('*', (req, res) => {
  const { Body, From } = req.body
  const message = {
    body: Body,
    from: From.slice(7)
  }
  io.emit('message', message)
})

io.on('connection', socket => {
  console.log('A user connected')

  socket.on('disconnect', () => console.log('A user disconnected'))

  socket.on('message', body => {
    socket.broadcast.emit('message', {
      body,
      from: socket.id.slice(7)
    })
  })
})

server.listen(port, "127.0.0.1", () => {
  console.log(`starting DEV server on http://localhost:${8080}`);
})
