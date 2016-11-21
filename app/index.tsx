/// <reference path="_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';

import '../node_modules/bootstrap/less/bootstrap.less';
import './styles/index.css';
import './styles/sidebar.css';
import './styles/budget.css';
import './styles/register.css';
import './styles/react-datepicker.css';
import './styles/fixed-data-table.css';

import CApp from './components/CApp';
import { GlobalActionsCreator } from './actionCreators';
import combinedReducer from './reducers/CombinedReducer';

injectTapEventPlugin();
const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));
var refreshDatabase:boolean = (process.env.NODE_ENV === 'development') ? true : false;
store.dispatch(GlobalActionsCreator.initializeDatabase(false));

ReactDOM.render(
	<Provider store={store}>
		<CApp />
	</Provider>,
  	document.getElementById('root')
);