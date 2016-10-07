/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { IEntity } from '../interfaces/common';
import { SimpleObjectMap } from '../utilities'; 

// TODO: Add sorting support
export class EntitiesArray<T extends IEntity> extends Array<T> {

	private internalMap:SimpleObjectMap<T> = {};

	constructor(initialValues:Array<T> = null) {
		super();
		// If an array of initial values is passed, iterate through them and add them to
		// this array one by one using the addObject method
		if(initialValues) {
			_.forEach(initialValues, (entity:T)=>{
				this.addEntity(entity);
			});
		}
	}

	public addOrReplaceEntity(entity:T):void {
		this.removeEntityById(entity.entityId);
		this.addEntity(entity);
	}

	public getEntityById(entityId:string):T {
		return this.internalMap[entityId];
	}

	public getAllItems():Array<T> {
		return this as Array<T>;
	}

	protected addEntity(entity:T):void {
		this.push(entity);
		this.internalMap[entity.entityId] = entity;
	}

	protected removeEntityById(entityId:string):T {
		var removedEntities:T[];
		// Check if we have an entity with the passed entityId. If we do, then remove that.
		if(this.internalMap[entityId]) {
			var index = _.findIndex(this, {entityId: entityId});
			removedEntities = this.splice(index, 1);
			this.internalMap[entityId] = null;
		}

		if(removedEntities && removedEntities.length > 0)
			return removedEntities[0];
		else
			return null;
	}
} 