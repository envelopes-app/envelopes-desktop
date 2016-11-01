/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { CatalogKnowledge } from '../KnowledgeObjects';
import { IDatabaseQuery } from '../../interfaces/persistence'; 
import * as catalogEntities from '../../interfaces/catalogEntities';
import * as catalogQueries from '../queries/catalogQueries';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export class GlobalSettingHelper {

	public getPersistenceQueries(
				changedEntities:ISimpleEntitiesCollection,
				originalEntities:IEntitiesCollection,
				catalogKnowledge:CatalogKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];

		if(changedEntities.globalSettings) {

			_.forEach(changedEntities.globalSettings, (changedEntity:catalogEntities.IGlobalSetting)=> {

				// Update the deviceKnowledge value on the entity
				changedEntity.deviceKnowledge = catalogKnowledge.getNextValue();

				// Add the query to the list to update this entity in the database
				queriesList.push(catalogQueries.GlobalSettingQueries.insertDatabaseObject(changedEntity));
			});
		}

		return queriesList;
	}
}
