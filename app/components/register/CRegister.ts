/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection } from '../../interfaces/state';
import { GlobalActionsCreator } from '../../actionCreators';

import { PRegister } from './PRegister';

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

const CRegister = connect(mapStateToProps, mapDispatchToProps)(PRegister);
export default CRegister;