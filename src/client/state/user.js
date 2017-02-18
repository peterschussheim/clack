import { createAction } from 'redux-actions';

export const AUTO_LOGIN = 'clack/user/login/auto';
export const LOGIN = 'clack/user/login';
export const LOGIN_SUCCESS = 'clack/user/login/success';
export const LOGOUT = 'clack/user/logout';

export default function reducer(
  state = {
    name: null,
  },
  action,
) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        name: action.payload.name,
      };
    case LOGOUT:
      return {
        ...state,
        name: null,
      };
    default:
      return state;
  }
}

export const autoLogin = createAction(AUTO_LOGIN);
export const login = createAction(LOGIN, user => ({ name: user }));
export const loginSuccess = createAction(LOGIN_SUCCESS, name => ({ name }));
export const logout = createAction(LOGOUT);
