import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Provider } from 'react-redux'
import { store } from './client/store/config'

import io from 'socket.io-client'
export const socket = io('http://localhost:8081/')
import Landing from './client/Landing';
import Room from './client/Room';


ReactDOM.render(
  <Provider store={store}>
    <Router>
        <div>
          <Route exact path="/" component={Landing} />
          <Route exact path="/room" component={Room} />
        </div>
    </Router>
  </Provider>,
  document.getElementById('container')
)
