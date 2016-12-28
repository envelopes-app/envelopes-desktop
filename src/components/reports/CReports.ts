/// <reference path="../../_includes.ts" />

import { connect, Dispatch } from 'react-redux';

import { DateWithoutTime } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection } from '../../interfaces/state';
import { GlobalActionsCreator } from '../../actionCreators';

import { PReports } from './PReports';

const mapStateToProps = (state:IApplicationState) => {
	return {
		activeBudgetId: state.activeBudgetId,
		entitiesCollection: state.entitiesCollection
  	};
};

const CReports = connect(mapStateToProps, null)(PReports);
export default CReports;