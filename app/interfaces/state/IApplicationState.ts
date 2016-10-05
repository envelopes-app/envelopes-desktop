import { IEntitiesCollection } from './IEntitiesCollection';
import { ISidebarState } from './ISidebarState';
import { IRegisterState } from './IRegisterState';
import { IBudgetState } from './IBudgetState';
import { DateWithoutTime } from '../../utilities';

export interface IApplicationState {

	// ****************************************************************************************************
	// Shared Global Data
	// ****************************************************************************************************
	entitiesCollection:IEntitiesCollection;
	
	// ****************************************************************************************************
	// UI State
	// ****************************************************************************************************
	selectedBudgetMonth:DateWithoutTime;

	sidebarState:ISidebarState;
	budgetState:IBudgetState;
}