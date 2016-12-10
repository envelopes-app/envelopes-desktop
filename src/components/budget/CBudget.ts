/// <reference path="../../_includes.ts" />

import { connect, Dispatch } from 'react-redux';

import { DateWithoutTime } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection } from '../../interfaces/state';
import { GlobalActionsCreator } from '../../actionCreators';

import { PBudget } from './PBudget';

const mapStateToProps = (state:IApplicationState) => {
	return {
		selectedBudgetMonth: state.selectedBudgetMonth,
		activeBudgetId: state.activeBudgetId,
		entitiesCollection: state.entitiesCollection
  	};
};

const mapDispatchToProps = (dispatch:Dispatch<IApplicationState>) => {
  	return {
		updateEntities:(entitiesCollection:ISimpleEntitiesCollection) => {
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		},
		setSelectedBudgetMonth:(month:DateWithoutTime) => {
      		dispatch(GlobalActionsCreator.ensureBudgetEntitiesForMonth(month));
		}
	}
}

const CBudget = connect(mapStateToProps, mapDispatchToProps)(PBudget);
export default CBudget;