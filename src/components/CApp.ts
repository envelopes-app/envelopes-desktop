/// <reference path="../_includes.ts" />

import { connect, Dispatch } from 'react-redux';

import { PApp } from './PApp';
import { IImportedAccountObject } from '../interfaces/objects';
import { IApplicationState, ISimpleEntitiesCollection } from '../interfaces/state';
import { GlobalActionsCreator } from '../actionCreators';
import * as catalogEntities from '../interfaces/catalogEntities';

const mapStateToProps = (state:IApplicationState) => {
	return {
    	applicationState: state
  	};
};

const mapDispatchToProps = (dispatch:Dispatch<IApplicationState>) => {
  	return { 
		createBudget:(budget:catalogEntities.IBudget) => {
      		dispatch(GlobalActionsCreator.createBudget(budget));
		},
		openBudget:(budget:catalogEntities.IBudget) => {
      		dispatch(GlobalActionsCreator.openBudget(budget));
		},
		cloneBudget:(budget:catalogEntities.IBudget) => {
      		dispatch(GlobalActionsCreator.cloneBudget(budget));
		},
		freshStartBudget:(budget:catalogEntities.IBudget) => {
      		dispatch(GlobalActionsCreator.freshStartBudget(budget));
		},
		updateEntities:(entitiesCollection:ISimpleEntitiesCollection) => {
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}
}

const CApp = connect(mapStateToProps, mapDispatchToProps)(PApp);
export default CApp;