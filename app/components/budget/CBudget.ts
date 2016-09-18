/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection } from '../../interfaces/state';
import { GlobalActionsCreator } from '../../actionCreators';

import { PBudget } from './PBudget';

const mapStateToProps = (state:IApplicationState) => {
	return {
		applicationState: state
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<IApplicationState>) => {
  	return {
		updateEntities:(entitiesCollection:ISimpleEntitiesCollection) => {
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}
}

const CBudget = connect(mapStateToProps, mapDispatchToProps)(PBudget);
export default CBudget;