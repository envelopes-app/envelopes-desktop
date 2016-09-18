/// <reference path="../_includes.ts" />

import { connect } from 'react-redux';

import { PApp } from './PApp';
import { IApplicationState } from '../interfaces/state';

const mapStateToProps = (state:IApplicationState) => {
	return {
    	applicationState: state
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<IApplicationState>) => {
  	return { }
}

const CApp = connect(mapStateToProps, mapDispatchToProps)(PApp);
export default CApp;