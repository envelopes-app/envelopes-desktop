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

import { fetchContacts } from './actions/ContactActions';
import combinedReducer from './reducers/CombinedReducer';
import { ApplicationState } from './models/ApplicationState';
import './styles/index.css';

injectTapEventPlugin();
const initialState = {};
const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));
store.dispatch(fetchContacts());

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={CContactsContainer} />
      </Route>
	  <Route path='*' component={App} />
    </Router>
  </Provider>,
  document.getElementById('root')
);
