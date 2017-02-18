import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import messages from './messages'
import session from './session'
import user from './user'

const rootReducer = combineReducers({
  messages,
  session,
  user,
  routing: routerReducer
})

export default rootReducer
