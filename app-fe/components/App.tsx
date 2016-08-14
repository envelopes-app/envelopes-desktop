/// <reference path="../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider, lightBaseTheme } from 'material-ui/styles';

import CSidebar from './sidebar/CSidebar';

import '../styles/App.css';

export interface AppProps {}

export class App extends React.Component<AppProps, {}> {
  
	public render() {
    	return (
			<MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
				<div className="App">
					<div className="App-Sidebar">
						<CSidebar />
					</div>
					<div className="App-ModuleContainer">
						{this.props.children}
					</div>
				</div>
			</MuiThemeProvider>
		);
  	}
}