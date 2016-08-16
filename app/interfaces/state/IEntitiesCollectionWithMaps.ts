import * as catalogEntities from '../catalogEntities';
import * as budgetEntities from '../budgetEntities';
import { SimpleObjectMap } from '../../utilities'; 
import { IEntitiesCollection } from './IEntitiesCollection';

export interface IEntitiesCollectionWithMaps extends IEntitiesCollection {

	// Maps to index the entities by their entityId
	accountsMap?:SimpleObjectMap<budgetEntities.IAccount>;
	accountMappingsMap?:SimpleObjectMap<budgetEntities.IAccountMapping>;
	masterCategoriesMap?:SimpleObjectMap<budgetEntities.IMasterCategory>;
	monthlyBudgetsMap?:SimpleObjectMap<budgetEntities.IMonthlyBudget>;
	monthlySubCategoryBudgetsMap?:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>;
	payeesMap?:SimpleObjectMap<budgetEntities.IPayee>;
	payeeLocationsMap?:SimpleObjectMap<budgetEntities.IPayeeLocation>;
	payeeRenameConditionsMap?:SimpleObjectMap<budgetEntities.IPayeeRenameCondition>;
	scheduledSubTransactionsMap?:SimpleObjectMap<budgetEntities.IScheduledSubTransaction>;
	scheduledTransactionsMap?:SimpleObjectMap<budgetEntities.IScheduledTransaction>;
	settingsMap?:SimpleObjectMap<budgetEntities.ISetting>;
	subCategoriesMap?:SimpleObjectMap<budgetEntities.ISubCategory>;
	subTransactionsMap?:SimpleObjectMap<budgetEntities.ISubTransaction>;
	transactionsMap?:SimpleObjectMap<budgetEntities.ITransaction>;
}