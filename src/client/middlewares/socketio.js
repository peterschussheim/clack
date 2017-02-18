import io from 'socket.io-client';
import {
  ADD_MESSAGE_SUCCESS,
  RECEIVE_ROOM,
  RECEIVE_MESSAGE,
} from '../state/messages';

import {
  JOIN_SESSION,
  LEAVE_SESSION,
  RECEIVE_CLIENT_LIST,
  RENAME_SESSION,
  RECEIVE_SESSION_NAME,
} from '../state/session';

import { LOGIN_SUCCESS } from '../state/user';

let socket = null;

export const init = store => {
  socket = io();

  socket.on('disconnect', () => {
    console.warn('Server disconnected');
    store.dispatch({ type: LEAVE_SESSION });
  });

  // Each of these actions will be listened to from SocketIO,
  // and will trigger a new client-side action when received
  const actions = [
    RECEIVE_ROOM,
    RECEIVE_MESSAGE,
    RECEIVE_CLIENT_LIST,
    RECEIVE_SESSION_NAME,

  ];

  actions.forEach(action => {
    socket.on(action, payload => {
      store.dispatch({ type: action, payload });
    });
  });
};

export const socketIoMiddleware = store => next => action => {
  const result = next(action);

  // Each of these actions will trigger an emit via SocketIO
  const actions = [
    ADD_MESSAGE_SUCCESS,
    JOIN_SESSION,
    LOGIN_SUCCESS,
    LEAVE_SESSION,
    RENAME_SESSION,
  ];

  if (actions.indexOf(action.type) > -1) {
    const state = store.getState();
    const sessionId = state.session.id;
    socket.emit(action.type, {
      sessionId,
      payload: action.payload,
    });
  }

  return result;
};
