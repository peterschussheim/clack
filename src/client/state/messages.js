import { createAction } from 'redux-actions';

import { LEAVE_SESSION, CREATE_SESSION_SUCCESS, JOIN_SESSION } from './session';

export const ADD_MESSAGE = 'clack/messages/add';
export const ADD_MESSAGE_SUCCESS = 'clack/messages/add/success';
export const RECEIVE_MESSAGE = 'clack/messages/receive/add';
export const RECEIVE_ROOM = 'clack/messages/receive-all';

export default function reducer(state = [], action) {
  switch (action.type) {
    case ADD_MESSAGE_SUCCESS:
    case RECEIVE_MESSAGE:
      return [...state, action.payload];
    case RECEIVE_ROOM:
      return action.payload;
    case LEAVE_SESSION:
    case CREATE_SESSION_SUCCESS:
    case JOIN_SESSION:
      return [];
    default:
      return state;
  }
}

export const addPost = createAction(ADD_MESSAGE, (messageType, content) => ({
  messageType,
  content,
}));

export const addMessageSuccess = createAction(ADD_MESSAGE_SUCCESS);
