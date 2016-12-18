/// <reference path="_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';

import '../node_modules/bootstrap/less/bootstrap.less';
import './styles/index.less';
import './styles/sidebar.less';
import './styles/budget.less';
import './styles/register.less';
import './styles/react-datepicker.css';
import './styles/fixed-data-table.css';

import CApp from './components/CApp';
import { GlobalActionsCreator } from './actionCreators';
import combinedReducer from './reducers/CombinedReducer';
import { Logger } from './utilities/Logger';

Logger.initializeLogging();

injectTapEventPlugin();
const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));
store.dispatch(GlobalActionsCreator.initializeDatabase(false));

ReactDOM.render(
	<Provider store={store}>
		<CApp />
	</Provider>,
  	document.getElementById('root')
);