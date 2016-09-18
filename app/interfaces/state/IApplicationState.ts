import { IEntitiesCollection } from './IEntitiesCollection';
import { ISidebarState } from './ISidebarState';
import { IRegisterState } from './IRegisterState';
import { IBudgetState } from './IBudgetState';
import { SimpleObjectMap } from '../../utilities';

export interface IApplicationState {

	// ****************************************************************************************************
	// Data
	// ****************************************************************************************************
	entitiesCollection:IEntitiesCollection;
	
	// ****************************************************************************************************
	// UI State
	// ****************************************************************************************************
	sidebarState:ISidebarState;
	budgetState:IBudgetState;
}