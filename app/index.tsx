/// <reference path="_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import './styles/index.css';
// Components that are to be used in route map
import { App } from './components/App';

import { GlobalActionsCreator } from './actionCreators';
import combinedReducer from './reducers/CombinedReducer';

injectTapEventPlugin();
const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));
var refreshDatabase:boolean = (process.env.NODE_ENV === 'development') ? true : false;
store.dispatch(GlobalActionsCreator.initializeDatabase(refreshDatabase));

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/index.html' component={App}>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);