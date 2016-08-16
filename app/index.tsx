/// <reference path="_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import { App } from './components/App';
import CContactsContainer from './components/contacts/CContactsContainer';

import { GlobalActionsCreator } from './actionCreators';
import combinedReducer from './reducers/CombinedReducer';
import './styles/index.css';

injectTapEventPlugin();
const initialState = {};
const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));
store.dispatch(GlobalActionsCreator.initializeDatabase(true));

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/index.html' component={App}>
        <IndexRoute component={CContactsContainer} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
