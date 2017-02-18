import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'react-router-redux';
import createLogger from 'redux-logger';

import reducers from '../state';
import sagas from '../sagas';
import { socketIoMiddleware } from '../middlewares/socketio';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(initialState = {}, browserHistory) {
  const middlewares = [];
  const sagaMiddleware = createSagaMiddleware();
  middlewares.push(thunk);
  middlewares.push(routerMiddleware(browserHistory));
  middlewares.push(socketIoMiddleware);
  middlewares.push(sagaMiddleware);
  middlewares.push(composeEnhancers);

  if (__DEVELOPMENT__) {
    const logger = createLogger({
      predicate: (getState, action) =>
        action.type !== 'EFFECT_TRIGGERED' && action.type !== 'EFFECT_RESOLVED',
    });
    middlewares.push(logger);
  }

  let createStoreWithMiddleware = applyMiddleware(...middlewares);

  if (__DEVTOOLS__) {
    createStoreWithMiddleware = compose(
      createStoreWithMiddleware,
    );
  }

  const finalCreateStore = createStoreWithMiddleware(createStore);
  const store = finalCreateStore(reducers, initialState);
  sagaMiddleware.run(sagas);

  if (__DEVELOPMENT__) {
    if (module.hot) {
      module.hot.accept('../state', () => {
        const nextReducer = require('../state');
        store.replaceReducer(nextReducer);
      });
    }
  }
  return store;
}
