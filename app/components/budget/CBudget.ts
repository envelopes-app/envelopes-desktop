/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import { DateWithoutTime } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection } from '../../interfaces/state';
import { GlobalActionsCreator } from '../../actionCreators';

import { PBudget } from './PBudget';

const mapStateToProps = (state:IApplicationState) => {
	return {
		selectedBudgetMonth: state.selectedBudgetMonth,
		currentBudget: state.currentBudget,
		entitiesCollection: state.entitiesCollection
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<IApplicationState>) => {
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