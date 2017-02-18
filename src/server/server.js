/* eslint-disable no-console */
import express from 'express';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import http from 'http';
import socketIo from 'socket.io';
import path from 'path';
import config from '../../webpack.config.js';

import chalk from 'chalk';
import find from 'lodash/find';
import moment from 'moment';
import db from './db/nedb';
import spamFilter from './spamFilter';

import {
  RECEIVE_MESSAGE,
  ADD_MESSAGE_SUCCESS,
  RECEIVE_CLIENT_LIST,
  RECEIVE_SESSION_NAME,
  RECEIVE_ROOM,
  JOIN_SESSION,
  RENAME_SESSION,
  LEAVE_SESSION,
  LOGIN_SUCCESS,
} from './actions/actions';

const antiSpam = (ip, cb) => cb();

const port = process.env.PORT || 8081
const app = express();
const compiler = webpack(config);

// helpers to color our console messages
const g = chalk.green.bind(chalk);
const b = chalk.blue.bind(chalk);
const gr = chalk.grey.bind(chalk);
const r = chalk.red.bind(chalk);
const y = chalk.yellow.bind(chalk);
const s = str => b(str.replace('clack/', ''));

let room;

const httpServer = new http.Server(app);
const io = socketIo(httpServer);

app.use(bodyParser.urlencoded({ extended: false }))

// app.use(
//   require('webpack-dev-middleware')(compiler, {
//     noInfo: true,
//     publicPath: config.output.staticsPath,
//   }),
// );

// app.use(require('webpack-hot-middleware')(compiler, {
//   noInfo: true,
//   staticsPath: config.output.staticsPath
// }));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../static/index.html'));
});

// const server = app.listen(port, '127.0.0.1', (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(`http://localhost:${port}`);
//   }
// });

// const io = socketIo(server)
db().then(store => {
  const users = {};
  const d = () => y(`[${moment().format('HH:mm:ss')}]`);

  const getRoom = sessionId => `room-${sessionId}`;

  const sendToAll = (socket, sessionId, action, data) => {
    console.log(`${d()}${g(' ==> ')} ${s(action)} ${gr(JSON.stringify(data))}`);
    socket.broadcast.to(getRoom(sessionId)).emit(action, data);
  };

  const sendToSelf = (socket, action, data) => {
    console.log(`${d()}${g(' --> ')} ${s(action)} ${gr(JSON.stringify(data))}`);
    socket.emit(action, data);
  };

  const persist = session =>
    store.set(session).catch(err => console.error(err));

  const sendClientList = (sessionId, socket) => {
    const room = io.nsps['/'].adapter.rooms[getRoom(sessionId)];
    if (room) {
      const clients = Object.keys(room.sockets);
      const names = clients.map((id, i) => users[id] || `(Anonymous #${i})`);

      sendToSelf(socket, RECEIVE_CLIENT_LIST, names);
      sendToAll(socket, sessionId, RECEIVE_CLIENT_LIST, names);
    }
  };

  const recordUser = (sessionId, name, socket) => {
    const socketId = socket.id;
    if (!users[socketId] || users[socketId] !== name) {
      users[socketId] = name || null;
    }

    sendClientList(sessionId, socket);
  };

  const receiveMessage = (session, data, socket) => {
    session.messages.push(data);
    persist(session);
    sendToAll(socket, session.id, RECEIVE_MESSAGE, data);
  };

  const joinSession = (session, data, socket) => {
    socket.join(getRoom(session.id), () => {
      socket.sessionId = session.id;
      if (session.messages.length) {
        sendToSelf(socket, RECEIVE_ROOM, session.messages);
      }
      if (session.name) {
        sendToSelf(socket, RECEIVE_SESSION_NAME, session.name);
      }

      recordUser(session.id, data.user, socket);
    });
  };

  const renameSession = (session, data, socket) => {
    session.name = data;
    persist(session);
    sendToAll(socket, session.id, RECEIVE_SESSION_NAME, data);
  };

  const leave = (session, data, socket) => {
    socket.leave(getRoom(session.id), () => {
      sendClientList(session.id, socket);
    });
  };

  const login = (session, data, socket) => {
    recordUser(session.id, data.name, socket);
  };


  // app.use('/assets', express.static(assetsFolder));
  // app.use('/static', express.static(staticFolder));
  // app.use(
  //   '/favicon.ico',
  //   express.static(path.resolve(staticFolder, 'favicon.ico')),
  // );
  app.get('/*', (req, res) => res.sendFile(htmlFile));

  io.on('connection', socket => {
    const ip = socket.handshake.headers['x-forwarded-for'] ||
      socket.handshake.address.address;
    antiSpam(ip, () => {
      console.log(
        d() + b(' Connection: ') + r('New user connected'),
        gr(socket.id),
        gr(ip),
      );

      const actions = [
        { type: ADD_MESSAGE_SUCCESS, handler: receiveMessage },
        { type: JOIN_SESSION, handler: joinSession },
        { type: RENAME_SESSION, handler: renameSession },
        { type: LOGIN_SUCCESS, handler: login },
        { type: LEAVE_SESSION, handler: leave },
      ];

      actions.forEach(action => {
        socket.on(action.type, data => {
          antiSpam(ip, () => {
            console.log(
              d() + r(' <--  ') + s(action.type),
              gr(JSON.stringify(data)),
            );
            const sid = action.type === LEAVE_SESSION
              ? socket.sessionId
              : data.sessionId;
            if (sid) {
              store.get(sid).then(session => {
                action.handler(session, data.payload, socket);
              });
            }
          });
        });
      });

      socket.on('disconnect', () => {
        if (socket.sessionId) {
          sendClientList(socket.sessionId, socket);
        }
      });
    });
  });

  httpServer.listen(port);
  const env = process.env.NODE_ENV || 'dev';
  console.log(`Server started on port ${r(port)}, environement: ${b(env)}`);
});

// app.post('/', (req, res) => {
//   console.log('hitting / post route in server');
//   console.log('req.body', req.body);
//   const { Body, From } = req.body
//   const message = {
//     body: Body,
//     from
//   }
//   io.emit('message', message)
// })

// io.on('connection', (socket) => {
//   console.log('a user connected from IP: ', ip);
//   socket.on('subscribe', data => {
//     room = data.room;
//     socket.join(room);
//     console.log('joined room', room);
//   });
//   socket.on('unsubscribe', () => {
//     socket.leave(room);
//     console.log('leaving room', room);
//   });
//   socket.on('disconnect', () => {
//     console.log('a user disconnected');
//   });

//   socket.on('chat message', (msg) => {
//     console.log('sending message to', msg.from);
//     console.log('this message', msg);
//     io.to(msg.room).emit('chat message', JSON.stringify(msg));
//   });
// });

