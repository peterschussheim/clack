import { createAction } from 'redux-actions';

export const CREATE_SESSION = 'clack/session/create';
export const CREATE_SESSION_SUCCESS = 'clack/session/create/success';
export const RENAME_SESSION = 'clack/session/rename';
export const RECEIVE_SESSION_NAME = 'clack/session/receive/rename';
export const AUTO_JOIN = 'clack/session/join/auto';
export const JOIN_SESSION = 'clack/session/join';
export const LEAVE_SESSION = 'clack/session/leave';
export const RECEIVE_CLIENT_LIST = 'clack/session/receive/client-list';
export const LOAD_PREVIOUS_SESSIONS = 'clack/session/load-previous';

export default function reducer(
  state = {
    id: null,
    name: null,
    clients: [],
    previousSessions: [],
  },
  action,
) {
  switch (action.type) {
    case CREATE_SESSION_SUCCESS:
    case JOIN_SESSION:
      return {
        ...state,
        id: action.payload.sessionId,
      };
    case RECEIVE_CLIENT_LIST:
      return {
        ...state,
        clients: action.payload,
      };
    case LEAVE_SESSION:
      return {
        ...state,
        id: null,
        name: null,
        clients: [],
      };
    case RENAME_SESSION:
    case RECEIVE_SESSION_NAME:
      return {
        ...state,
        name: action.payload,
      };
    case LOAD_PREVIOUS_SESSIONS:
      return {
        ...state,
        previousSessions: action.payload,
      };
    default:
      return state;
  }
}

export const renameSession = createAction(RENAME_SESSION);
export const createSession = createAction(CREATE_SESSION);
export const joinSession = createAction(JOIN_SESSION);
export const createSessionSuccess = createAction(CREATE_SESSION_SUCCESS);
export const receiveClientList = createAction(RECEIVE_CLIENT_LIST);
export const loadPreviousSessions = createAction(LOAD_PREVIOUS_SESSIONS);
export const leave = createAction(LEAVE_SESSION);
export const autoJoin = createAction(AUTO_JOIN);