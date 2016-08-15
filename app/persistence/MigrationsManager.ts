/// <reference path='../_includes.ts' />

import { IDatabaseQuery, IDatabaseMigration } from '../interfaces/persistence';

export class MigrationsManager {

	private versionMigrations:Array<IDatabaseMigration> = [];

	constructor() {

		// Placeholder version so we can correctly calculate current version number using (versionMigrations.length - 1)
		this.versionMigrations[0] = null;

		// this._versionMigrations[1] = { getDatabaseQueries: this.getTrialExpiresNameChangeMigration, requiresFullCalculations: false };
	}

	public getMigrationScripts(currentDatabaseVersionNumber:number): Array<IDatabaseMigration> {

		var migrationScripts:Array<IDatabaseMigration> = [];

		// Get all migration scripts starting from currentVersionNumber + 1 and up to latest migration
		for (var i = (currentDatabaseVersionNumber + 1); i < this.versionMigrations.length; i++) {
			migrationScripts = migrationScripts.concat(this.versionMigrations[i]);
		}

		return migrationScripts;
	}

	public getLatestMigrationVersionNumber():number {

		return (this.versionMigrations.length - 1);
	}

	private getEmptyMigration():Array<IDatabaseQuery> {

		// This is for when we do not have any queries to run and just want to queue full calcs
		return [];
	}

/*
	// SAMPLE MIGRATION
	private getTrialExpiresNameChangeMigration(): Array<IDatabaseQuery> {

		// The "freeTrialExpiresOn" column on the Users table was renamed to "trialExpiresOn".
		// This migration updates the existing database for this change.

		return [
			{
				// Rename the original table
				query: "ALTER TABLE Users RENAME TO Users_Orig",
				arguments: []
			},
			{
				// Recreate the table with new definition
				query: `CREATE TABLE IF NOT EXISTS 'Users' (
					'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
					'userName' VARCHAR,
					'email' VARCHAR NOT NULL,
					'trialExpiresOn' DATETIME,
					'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				// Copy the data from the original table to the new table
				query: "INSERT INTO Users(entityId, userName, email, trialExpiresOn, deviceKnowledge) SELECT entityId, userName, email, freeTrialExpiresOn, deviceKnowledge FROM Users_Orig;",
				arguments: []
			},
			{
				// Delete the original table
				query: "DROP TABLE Users_Orig;",
				arguments: []
			}
		];
	}
*/
}