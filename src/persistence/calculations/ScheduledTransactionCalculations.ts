/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { TransactionFrequency, ClearedFlag, InternalCategories, SubCategoryType } from '../../constants';
import { BudgetKnowledge } from '../KnowledgeObjects'; 
import { EntityFactory } from '../EntityFactory';
import { IDatabaseQuery } from '../../interfaces/persistence';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { DateWithoutTime, Logger, SerializationUtilities, KeyGenerator, SimpleObjectMap, MultiDictionary } from '../../utilities';
import { ISimpleEntitiesCollection } from '../../interfaces/state';
import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge } from '../QueryExecutionUtility';
import { IReferenceDataForCalculations, IScheduledTransactionCalculationsData, IScheduledTransactionCalculationsResult } from '../../interfaces/calculations';
import { BudgetDateQueries, CalculationQueries } from '../queries/miscQueries';
import { AccountQueries, TransactionQueries, ScheduledTransactionQueries, PayeeQueries, SubCategoryQueries, MonthlySubCategoryBudgetQueries } from '../queries/budgetQueries';

export class ScheduledTransactionCalculations {

	private firstRun:boolean = true;

	// *************************************************************************************************************
	// Methods for overriding by derived classes
	// *************************************************************************************************************
	protected loadData(budgetId:string):Promise<IScheduledTransactionCalculationsData> {

		var queriesList:Array<IDatabaseQuery> = [
			AccountQueries.getAllAccounts(budgetId),
			ScheduledTransactionQueries.getAllScheduledTransactions(budgetId),
			BudgetDateQueries.getFirstAndLastBudgetMonthQuery(budgetId),
			PayeeQueries.getTransferPayees(budgetId),
			SubCategoryQueries.getAllSubCategories(budgetId),
			MonthlySubCategoryBudgetQueries.getMonthlySubCategoryBudgetsForScheduledCalculations(budgetId)
		];

		return executeSqlQueries(queriesList)
			.then((result:any)=>{

				// Get the min/max dates, convert them to DateWithoutTime, and store back in the result object
				var firstLastBudgetMonth = (<any>result).firstLastBudgetMonth[0];
				result.firstMonth = DateWithoutTime.createFromISOString(firstLastBudgetMonth.firstMonth);
				result.lastMonth = DateWithoutTime.createFromISOString(firstLastBudgetMonth.lastMonth);
				
				// Create an object to store the map of payee ids by their account ids
				result.payeesMapByAccountId = {};
				// Iterate through the payees and build the map
				if(result.payees && result.payees.length > 0) {

					_.forEach(result.payees, (payee:budgetEntities.IPayee)=>{
						result.payeesMapByAccountId[payee.accountId] = payee.entityId;
					});
				}

				result.accountsOnBudgetMap = {};
				// Iterate through the accounts and build the map
				if(result.accounts && result.accounts.length > 0) {

					_.forEach(result.accounts, (account:budgetEntities.IAccount)=>{
						result.accountsOnBudgetMap[account.entityId] = account.onBudget;
					});
				}
				
				result.userSubCategoryIds = [];
				_.forEach(result.subCategories, (subCategory:budgetEntities.ISubCategory)=>{

					if(subCategory.internalName == InternalCategories.UncategorizedSubCategory)
						result.uncategorizedSubCategoryId = subCategory.entityId;
					
					else if(subCategory.type == SubCategoryType.Default || subCategory.type == SubCategoryType.Debt)
						result.userSubCategoryIds.push(subCategory.entityId);
				});

				return result;
			});
	}

	protected saveData(budgetId:string,
						updatedEntities:IScheduledTransactionCalculationsResult,
						upcomingTransactionValues:Array<{monthlySubCategoryBudgetId:string, upcomingTransactions:number, upcomingTransactionsCount:number}>,
						budgetKnowledge:BudgetKnowledge,
						createUndoChangeSet:boolean):Promise<number> {

		// Before inserting the generated transactions and sub-transactions, we want to make sure that there are
		// no primary key collisions with existing entities.
		return this.updateEntitiesToAvoidCollision(updatedEntities)
			.then((retVal:boolean)=>{

				var query:IDatabaseQuery;
				var queryList:Array<IDatabaseQuery> = [];

				// Iterate through the passed scheduled transactions and create queries to persist them
				_.forEach(updatedEntities.scheduledTransactions, (scheduledTransaction:budgetEntities.IScheduledTransaction)=>{

					query = {
						name:"query1",
						query:`UPDATE ScheduledTransactions SET
									upcomingInstances = ?3,
									isTombstone = ?4,
									deviceKnowledgeForCalculatedFields = ?5
								WHERE budgetId = ?1 AND entityId = ?2 AND (upcomingInstances IS NULL OR upcomingInstances != ?3 OR isTombstone != ?4)`,
						arguments:[
							budgetId,
							scheduledTransaction.entityId,
							scheduledTransaction.upcomingInstances,
							scheduledTransaction.isTombstone,
							budgetKnowledge.getNextValueForCalculations()]
					};

					queryList.push(query);
				});

				// Iterate through the transactions and create queries for persisting them
				_.forEach(updatedEntities.transactions, (transaction:budgetEntities.ITransaction)=>{
					queryList = queryList.concat( this.insertTransactions(transaction, budgetKnowledge) );
				});

				// Create queries for updating the upcomingTransaction values in monthly subcategory budgets
				_.forEach(upcomingTransactionValues, (upcomingTransactionValue:{monthlySubCategoryBudgetId:string, upcomingTransactions:number, upcomingTransactionsCount:number})=>{

					var query = {
						name:"query2",
						query:"UPDATE MonthlySubCategoryBudgets SET upcomingTransactions = ?1, upcomingTransactionsCount = ?2, deviceKnowledgeForCalculatedFields = ?3 WHERE budgetId = ?4 AND entityId = ?5",
						arguments:[
							upcomingTransactionValue.upcomingTransactions,
							upcomingTransactionValue.upcomingTransactionsCount,
							budgetKnowledge.getNextValueForCalculations(),
							budgetId, 
							upcomingTransactionValue.monthlySubCategoryBudgetId]
					};
					queryList.push(query);
				});

				return executeSqlQueriesAndSaveKnowledge(queryList, budgetId, budgetKnowledge)
					.then((result:any)=>{

						// Sum  up the number of rows affected for each of the query that we executed.
						var query1RowsAffected = result["query1_rows_affected"] ? result["query1_rows_affected"] : 0;
						var query2RowsAffected = result["query2_rows_affected"] ? result["query2_rows_affected"] : 0;
						var transactionsRowsAffected = result["transactions_rows_affected"] ? result["transactions_rows_affected"] : 0;
						var subTransactionsRowsAffected = result["subTransactions_rows_affected"] ? result["subTransactions_rows_affected"] : 0;
						var rowsAffected:number = query1RowsAffected + query2RowsAffected + transactionsRowsAffected + subTransactionsRowsAffected;
						return rowsAffected;
					});
			});
	}

	private insertTransactions(transaction:budgetEntities.ITransaction, budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queryList:Array<IDatabaseQuery> = [];
		// Insert the transaction object
		transaction.deviceKnowledge = budgetKnowledge.getNextValue();
		queryList.push(TransactionQueries.insertDatabaseObject(transaction));

		// Queue necessary calculations for the transaction
		var date = DateWithoutTime.createFromUTCTime(transaction.date);
		date.startOfMonth();

		// Queue an account and transaction calculation for the account that this belongs to
		queryList.push(CalculationQueries.getQueueAccountCalculationQuery(transaction.budgetId, transaction.accountId, date.toISOString()));
		queryList.push(CalculationQueries.getQueueTransactionCalculationQuery(transaction.budgetId, transaction.accountId, date.toISOString()));
		// Also queue a monthly budget calculation for this.
		queryList.push(CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(transaction.budgetId, transaction.subCategoryId, date.toISOString()));
		return queryList;
	}

	private updateEntitiesToAvoidCollision(updatedEntities:ISimpleEntitiesCollection):Promise<boolean> {

		if(!updatedEntities.transactions)
			return Promise.resolve(true);

		// We basically want to make sure that the deterministic ids that we have assigned to the created transactions and
		// sub-transactions are unique and do not already exist. If they do, we need to update the ids by appending _1, _2
		// etc. to make them unique.
		var queryList:Array<IDatabaseQuery> = [];

		_.forEach(updatedEntities.transactions, (transaction:budgetEntities.ITransaction)=>{

			queryList.push({
				name:"transactionIds",
				query: "SELECT entityId FROM Transactions WHERE budgetId = ?1 AND entityId LIKE ?2",
				arguments: [transaction.budgetId, transaction.entityId + "%"]
			});
		});

		return executeSqlQueries(queryList)
			.then((result:any)=>{

				// Iterate through all the transaction, and for each transaction make sure that we don't have
				// an entityId collision.
				_.forEach(updatedEntities.transactions, (transaction:budgetEntities.ITransaction)=>{

					var entityId = transaction.entityId;
					var numberToAppend = 0;

					while( _.findIndex(result.transactionIds, {'entityId':entityId}) != -1 ) {

						entityId = transaction.entityId + "_" + numberToAppend;
						numberToAppend++;
					}

					transaction.entityId = entityId;
				});

				return true;
			});
	}

	// *************************************************************************************************************
	// Main Calculation Performing Method
	// *************************************************************************************************************
	public performCalculations(budgetId:string,
								budgetKnowledge:BudgetKnowledge,
								currentDate:DateWithoutTime = null,
								scheduledTransactionIds:Array<string> = null):Promise<IScheduledTransactionCalculationsResult> {

		if(!currentDate) {
			currentDate = DateWithoutTime.createForToday();
		}

		// Load the data required for performing the calculations
		return this.loadData(budgetId)
			.then((data:IScheduledTransactionCalculationsData)=> {

				return this.internalPerformCalculations(budgetId, budgetKnowledge, currentDate, scheduledTransactionIds, data, false, false);
			});
	}

	public generateUpcomingTransactionNow(budgetId:string,
											budgetKnowledge:BudgetKnowledge,
											scheduledTransactionIds:Array<string>):Promise<IScheduledTransactionCalculationsResult> {

		// The performCalculations method supports passing in a current date as a parameter. It then generates any transactions
		// that are due relative to the passed 'current' date. So we are going to load the data for the scheduled transactions, and
		// then get the upcoming instance dates for the passed scheduled transaction. We will then pass the first upcoming instance
		// date for the scheduled transaction as the current date so that a transaction is generated against it.

		// Load the data required for performing the calculations
		return this.loadData(budgetId)
			.then((data:IScheduledTransactionCalculationsData)=> {

				return _.reduce(scheduledTransactionIds, (prevPromise:Promise<IScheduledTransactionCalculationsResult>, scheduledTransactionId:string)=>{

					return prevPromise.then(()=>{

						// Get the scheduled transaction against the passed scheduled transaction id.
						var scheduledTransaction = _.find(data.scheduledTransactions, {"entityId": scheduledTransactionId});
						if(!scheduledTransaction || !scheduledTransaction.upcomingInstances)
							return Promise.resolve(null);

						// Get the existing list of upcomingInstanceDates from the scheduled transaction
						var upcomingInstanceDates = SerializationUtilities.deserializeDateArray(scheduledTransaction.upcomingInstances);
						// Pass the first date from the array of "upcomingInstanceDates" as the current date. This would result in creation
						// of a transaction instance against the "upcomingInstanceDate".
						return this.internalPerformCalculations(budgetId, budgetKnowledge, upcomingInstanceDates[0], [scheduledTransactionId], data, true, true);
					});
				}, Promise.resolve(null));
			});
	}

	private internalPerformCalculations(budgetId:string,
										budgetKnowledge:BudgetKnowledge,
										currentDate:DateWithoutTime,
										scheduledTransactionIds:Array<string>,
										data:IScheduledTransactionCalculationsData,
										useTodaysDateForGeneratedTransactions:boolean, 
										createUndoChangeSet:boolean):Promise<IScheduledTransactionCalculationsResult> {

		var calculationResults:IScheduledTransactionCalculationsResult = {
			database_rows_affected: 0,
			transactions: [],
			scheduledTransactions: []
		};

		// If no scheduled transaction ids are passed, we are going to perform calculations
		// for all the scheduled transactions.
		if(!scheduledTransactionIds) {

			scheduledTransactionIds = _.map(data.scheduledTransactions, (scheduledTransaction:budgetEntities.IScheduledTransaction)=>{
				return scheduledTransaction.entityId;
			});
		}

		// Get the end date for calculating the transaction generation dates. This would be the max month for which
		// we have monthly budgets available
		var endDate = data.lastMonth.clone();
		endDate.endOfMonth();

		// Build a map of scheduled transactions by their id
		var scheduledTransactionsMap:SimpleObjectMap<budgetEntities.IScheduledTransaction> = {};
		_.forEach(data.scheduledTransactions, function(scheduledTransaction:budgetEntities.IScheduledTransaction) {
			scheduledTransactionsMap[scheduledTransaction.entityId] = scheduledTransaction;
		});

		// Iterate through all the passed scheduled transaction ids
		_.forEach(scheduledTransactionIds, (scheduledTransactionId:string)=>{

			// Get the scheduled transaction corresponding to this from the map
			var scheduledTransaction = scheduledTransactionsMap[scheduledTransactionId];
			// Just making sure that we don't process tombstoned scheduled transactions. Also since we are not
			// loading scheduled transactions from closed accounts, if we were passed any such scheduledTransactionId,
			// it would simply be ignored.
			if (scheduledTransaction && scheduledTransaction.isTombstone == 0) {

				// Get the existing list of upcomingInstanceDates from the scheduled transaction
				var upcomingInstanceDates = SerializationUtilities.deserializeDateArray(scheduledTransaction.upcomingInstances);

				// First calculate the upcoming instance dates for this scheduled transaction. This adds new dates
				// to the end of the upcomingInstanceDates array.
				upcomingInstanceDates = this.calculateUpcomingInstanceDates(scheduledTransaction, upcomingInstanceDates, currentDate, endDate);

				// Check if there are any overdue dates in this scheduled transaction for which we need to generate transactions
				this.generatePendingTransactions(budgetId, scheduledTransaction, upcomingInstanceDates, currentDate, data, calculationResults, useTodaysDateForGeneratedTransactions);

				// Serialize the list of upcoming instance dates into a string and update the entity with them.
				// Only update the entity if the list has actually changed or the entity has been tombstoned.
				var upcomingInstanceDatesString = SerializationUtilities.serializeDateArray(upcomingInstanceDates);
				if (scheduledTransaction.isTombstone == 1 || scheduledTransaction.upcomingInstances != upcomingInstanceDatesString) {

					scheduledTransaction.upcomingInstances = upcomingInstanceDatesString;
					// Add this to the list of updated scheduled transactions
					calculationResults.scheduledTransactions.push(scheduledTransaction);
				}
			}
		});

		// Re-calculate the upcoming transactions starting from the current month upto the end month
		var upcomingTransactionResults:Array<{monthlySubCategoryBudgetId:string, upcomingTransactions:number, upcomingTransactionsCount:number}>;
		upcomingTransactionResults = this.calculateUpcomingTransactions(budgetId, data, endDate);

		// Persist the updated data
		return this.saveData(budgetId, calculationResults, upcomingTransactionResults, budgetKnowledge, createUndoChangeSet)
			.then((rowsAffected:number)=>{

				this.firstRun = false;
				calculationResults.database_rows_affected = rowsAffected;
				return calculationResults;
			});
	}

	// ***************************************************************************************************
	// Methods for calculating upcoming instance dates for scheduled transactions
	// ***************************************************************************************************
	private calculateUpcomingInstanceDates(scheduledTransaction:budgetEntities.IScheduledTransaction,
											upcomingInstanceDates:Array<DateWithoutTime>,
											currentDate:DateWithoutTime,
											endDate:DateWithoutTime):Array<DateWithoutTime> {

		var today = DateWithoutTime.createForToday();
		var startDate = DateWithoutTime.createFromUTCTime(scheduledTransaction.date);
		var startDay:number = startDate.getDate();
		var nextCreationDate:DateWithoutTime;
		var lastCreationDate:DateWithoutTime;
		var skipTransactionsBetweenFirstAndToday:boolean = false;
		var instancesAfterCurrentDateCount = 0;

		// Calculate the count of upcomingInstance dates that are already in the array, and are after the passed
		// current date.
		_.forEach(upcomingInstanceDates, (upcomingInstanceDate:DateWithoutTime)=>{

			if(upcomingInstanceDate.isAfter(currentDate))
				instancesAfterCurrentDateCount++;
		});

		if(upcomingInstanceDates.length > 0) {

			// If the scheduled transaction already has a bunch of upcomingInstanceDates calculated, then we
			// are going to start from the last date already in the array, and append more dates up to the end date.
			lastCreationDate = upcomingInstanceDates[upcomingInstanceDates.length - 1];
			nextCreationDate = this.getNextDateForFrequency(lastCreationDate, scheduledTransaction.frequency, startDay);
		}
		else {

			// If however the upcomingInstanceDates is currently empty, then we are going to start from the
			// transaction date and work our way to the end date.
			nextCreationDate = DateWithoutTime.createFromUTCTime(scheduledTransaction.date);

			// Adam says if we enter a transaction dated 2 years ago, that one will be entered,
			// Then we'll skip all of the transactions up until today or after
			// so you entered a daily transaction for 2 years ago, you'd get that first one, and you'd get today (two instances)
			// and the scheduled transaction would be left scheduled for tomorrow
			// If this transaction is future dated, nothing will happen
			if(nextCreationDate.isPastDate())
				skipTransactionsBetweenFirstAndToday = true;
		}

		// The end date is taken as the max month for which we have a monthly budget created (mostly two months in
		// the future). For most frequencies of scheduled transactions, this means that we would have multiple
		// upcomingInstanceDates during this period. For some frequencies however, like yearly for instance, or if
		// the user sets the date too far into the future, we would have no upcoming instance date less then the end
		// date. So to cover for these cases, we are going to loop until we have at least one entry in the
		// upcomingInstanceDates array that is greater then the passed current date.
		while(nextCreationDate != null
			&& (nextCreationDate.isBefore(endDate) || nextCreationDate.equalsDateWithoutTime(endDate) || instancesAfterCurrentDateCount == 0)) {

			if(skipTransactionsBetweenFirstAndToday) {

				// Only add this date to the list of upcoming instances if it is the first date in there, or
				// it is greater or equal then today. This ensures that only the first of the past dates gets
				// entered, and we skip all other past dates.
				if(upcomingInstanceDates.length == 0 || nextCreationDate.isPastDate() == false) {

					upcomingInstanceDates = upcomingInstanceDates.concat(nextCreationDate);
					if(nextCreationDate.isAfter(currentDate))
						instancesAfterCurrentDateCount++;
				}
			}
			else {
				upcomingInstanceDates = upcomingInstanceDates.concat(nextCreationDate);
				if(nextCreationDate.isAfter(currentDate))
					instancesAfterCurrentDateCount++;
			}

			nextCreationDate = this.getNextDateForFrequency(nextCreationDate, scheduledTransaction.frequency, startDay);
		}

		return upcomingInstanceDates;
	}

	private getNextDateForFrequency(lastCreationDate:DateWithoutTime, frequency:string, startDay:number):DateWithoutTime {

		var nextDate:DateWithoutTime = lastCreationDate.clone();

		switch(frequency) {

			case TransactionFrequency.Once:
				nextDate = null;
				break;

			case TransactionFrequency.Daily:
				nextDate.addDays(1);
				break;

			case TransactionFrequency.Weekly:
				nextDate.addDays(7);
				break;

			case TransactionFrequency.EveryOtherWeek:
				nextDate.addDays(14);
				break;

			case TransactionFrequency.TwiceAMonth:
				nextDate = this.getNextDateForTwiceAMonthFrequency(nextDate, startDay);
				break;

			case TransactionFrequency.Every4Weeks:
				nextDate.addDays(28);
				break;

			case TransactionFrequency.Monthly:
				nextDate = this.getNextDateForMonthlyFrequency(nextDate, 1, startDay);
				break;

			case TransactionFrequency.EveryOtherMonth:
				nextDate = this.getNextDateForMonthlyFrequency(nextDate, 2, startDay);
				break;

			case TransactionFrequency.Every3Months:
				nextDate = this.getNextDateForMonthlyFrequency(nextDate, 3, startDay);
				break;

			case TransactionFrequency.Every4Months:
				nextDate = this.getNextDateForMonthlyFrequency(nextDate, 4, startDay);
				break;

			case TransactionFrequency.TwiceAYear:
				nextDate = this.getNextDateForMonthlyFrequency(nextDate, 6, startDay);
				break;

			case TransactionFrequency.Yearly:
				nextDate = this.getNextDateForMonthlyFrequency(nextDate, 12, startDay);
				break;

			default:
				throw new Error("Invalid frequency was set in the scheduled transaction.");
		}

		return nextDate;
	}

	private getNextDateForTwiceAMonthFrequency(lastCreationDate:DateWithoutTime, startDay:number):DateWithoutTime {

		var nextDate:DateWithoutTime;

		if(startDay > 15)
			startDay -= 15;

		var lastCreationDay = lastCreationDate.getDate();
		var lastCreationMonth = lastCreationDate.getMonth();

		if(lastCreationDay == startDay) {

			// The last day this scheduled transaction was created was the 1st entry for the month
			// Go 15 days into the future
			nextDate = lastCreationDate.addDays(15);

			// Check for going past the end of the month
			if(nextDate.getMonth() != lastCreationMonth) {

				// We've gone too far, clamp to the end of the month
				nextDate.startOfMonth().subtractDays(1);
			}
		}
		else {

			// The last day this scheduled transaction was created was the 2nd entry for the month
			// Go back 15 days and forward one month
			nextDate = lastCreationDate.subtractDays(15).addMonths(1);

			// Adjust by the difference between this day and the start day
			var difference = startDay - nextDate.getDate();
			nextDate.addDays(difference);
		}

		return nextDate;
	}

	private getNextDateForMonthlyFrequency(lastCreationDate:DateWithoutTime, numberOfMonths:number, startDay:number):DateWithoutTime {

		// Start by jumping forward the appropriate number of months
		var nextDate = lastCreationDate.addMonths(numberOfMonths);
		var nextDay = nextDate.getDate();

		// We'll use the lower of the number of days in the month, and the original start day, as the start day
		var maxDays = nextDate.daysInMonth();
		startDay = Math.min(maxDays, startDay);

		// Adjust by the difference between this day and the start day
		var difference = startDay - nextDay;
		nextDate.addDays(difference);

		return nextDate;
	}

	// ***************************************************************************************************
	// Methods for generating due transactions from the scheduled transactions
	// ***************************************************************************************************
	private generatePendingTransactions(budgetId:string,
										scheduledTransaction:budgetEntities.IScheduledTransaction,
										upcomingInstanceDates:Array<DateWithoutTime>,
										currentDate:DateWithoutTime,
										data:IScheduledTransactionCalculationsData,
										calculationResults:IScheduledTransactionCalculationsResult,
										useTodaysDateForGeneratedTransactions:boolean):void {

		Logger.info(`ScheduledTransactionCalculations::generatePendingTransactions::Generating pending transactions for ${scheduledTransaction.entityId}`);

		// Counter to keep track of how many upcoming instance dates were converted to transactions.
		var datesToRemove:number = 0;
		var todaysDate = DateWithoutTime.createForToday();

		// Iterate through this date array, and generate transactions for all dates that are less then or equal to today
		_.forEach(upcomingInstanceDates, (upcomingInstanceDate:DateWithoutTime)=>{

			// As soon as we hit a date that is after today, exit the loop
			if(upcomingInstanceDate.isAfter(currentDate))
				return false;

			if(useTodaysDateForGeneratedTransactions) {

				// Generate transaction for this date and add them to the changed entities collection
				this.createTransaction(budgetId, scheduledTransaction, todaysDate, data, calculationResults);
			}
			else {

				// Generate transaction for this date and add them to the changed entities collection
				this.createTransaction(budgetId, scheduledTransaction, upcomingInstanceDate, data, calculationResults);
			}

			datesToRemove++;
		});

		// Remove dates from the upcomingInstances array equal to the number of transactions that have been created
		if(datesToRemove > 0) {

			var datesRemoved = upcomingInstanceDates.splice(0, datesToRemove);
			Logger.info(`ScheduledTransactionCalculations::generatePendingTransactions::Transactions created for ${datesRemoved.toString()}.`);
		}

		// If the frequency of this scheduled transaction was never, and there is no date in the
		// upcomingInstances array, then tombstone this scheduled transaction.
		if(scheduledTransaction.frequency == TransactionFrequency.Once && upcomingInstanceDates.length == 0)
			scheduledTransaction.isTombstone = 1;
	}

	private createTransaction(budgetId:string,
									scheduledTransaction:budgetEntities.IScheduledTransaction,
									date:DateWithoutTime,
									data:IScheduledTransactionCalculationsData,
									calculationResults:IScheduledTransactionCalculationsResult):void {

		// We need to use a deterministic transaction ID because a scheduled transaction could be fired
		// from multiple clients and we need to ensure it does not get duplicated.
		var transactionEntityId:string = KeyGenerator.getScheduledTransactionTransactionId(scheduledTransaction, date);
		var transaction = EntityFactory.createNewTransaction(budgetId);
		transaction.entityId = transactionEntityId;
		transaction.accountId = scheduledTransaction.accountId;
		transaction.date = date.getUTCTime();

		// Copy the rest of the values from the scheduled transaction into this transaction entity
		transaction.flag = scheduledTransaction.flag;
		transaction.payeeId = scheduledTransaction.payeeId;
		transaction.subCategoryId = scheduledTransaction.subCategoryId;
		transaction.scheduledTransactionId = scheduledTransaction.entityId;
		transaction.memo = scheduledTransaction.memo;
		transaction.amount = scheduledTransaction.amount;
		transaction.cleared = ClearedFlag.Uncleared;
		transaction.accepted = 0;
		transaction.scheduledTransactionId = scheduledTransaction.entityId;
		transaction.dateEnteredFromSchedule = DateWithoutTime.createForToday().getUTCTime();
		transaction.transferAccountId = scheduledTransaction.transferAccountId;

		if(scheduledTransaction.transferAccountId) {

			var payeeIdForTransferTransaction:string = data.payeesMapByAccountId[scheduledTransaction.accountId];

			// We also need to create the other side of this transfer transaction
			var transferTransaction = EntityFactory.createNewTransaction(budgetId);

			// We need to use a deterministic transfer transaction ID because a scheduled transaction could be fired
			// from multiple clients and we need to ensure it does not get duplicated.
			var transferTransactionEntityId:string = KeyGenerator.getScheduledTransactionTransferTransactionId(scheduledTransaction, date);
			transferTransaction.entityId = transferTransactionEntityId;
			transferTransaction.accountId = scheduledTransaction.transferAccountId;
			transferTransaction.date = date.getUTCTime();
			// Copy the rest of the values from the scheduled transaction into this transaction entity
			transferTransaction.flag = scheduledTransaction.flag;
			transferTransaction.payeeId = payeeIdForTransferTransaction;
			transferTransaction.memo = scheduledTransaction.memo;
			transferTransaction.amount = -(scheduledTransaction.amount);
			transferTransaction.cleared = ClearedFlag.Uncleared;
			transferTransaction.accepted = 0;
			transferTransaction.transferAccountId = scheduledTransaction.accountId;
			transferTransaction.transferTransactionId = transactionEntityId;
			transferTransaction.scheduledTransactionId = scheduledTransaction.entityId;

			// Get the transaction database object from this transfer transaction entity and save it in the changed entities
			calculationResults.transactions.push( transferTransaction );

			// Also update the transferTransactionId value on the transaction entity
			transaction.transferTransactionId = transferTransaction.entityId;
		}

		// Get the transaction database object from this transaction entity and save it in the calculation results
		calculationResults.transactions.push( transaction );
	}

	// ***************************************************************************************************
	// Method for calculating upcoming transactions for monthly subcategories
	// ***************************************************************************************************
	private calculateUpcomingTransactions(budgetId:string,
											data:IScheduledTransactionCalculationsData,
											endMonth:DateWithoutTime):Array<{monthlySubCategoryBudgetId:string, upcomingTransactions:number, upcomingTransactionsCount:number}> {

		var upcomingTransactionResults:Array<{monthlySubCategoryBudgetId:string, upcomingTransactions:number, upcomingTransactionsCount:number}> = [];
		var month = data.firstMonth.clone();
		var currentMonth = DateWithoutTime.createForCurrentMonth();
		var subCategoryIds = [data.uncategorizedSubCategoryId].concat(data.userSubCategoryIds);

		// Build a map of monthlySubCategoryBudget values. The monthlySubCategoryBudget values that we loaded from the database
		// contain existing "upcomingTransaction" values. We are going to compare these to the new values that we calculate here,
		// so that we can determine what values have changed, and then only update those values in the database.
		var monthlySubCategoryBudgetsMap:SimpleObjectMap<{entityId:string, month:string, upcomingTransactions:number, upcomingTransactionsCount:number}> = {};
		_.forEach(data.monthlySubCategoryBudgets, function(monthlySubCategoryBudgetValue:{entityId:string, month:string, upcomingTransactions:number, upcomingTransactionsCount:number}) {
			monthlySubCategoryBudgetsMap[monthlySubCategoryBudgetValue.entityId] = monthlySubCategoryBudgetValue;
		});

		// This contains the upcoming instance dates against scheduled transaction ids. This is so that we don't have to de-serialize
		// the upcomingInstances field on the scheduled transactions more then once
		var upcomingInstancesMap:SimpleObjectMap< Array<DateWithoutTime> > = {};
		// Iterate through all the scheduled transactions and deserialize their upcomingInstances values
		_.forEach(data.scheduledTransactions, (scheduledTransaction:budgetEntities.IScheduledTransaction)=> {

			var upcomingInstances = SerializationUtilities.deserializeDateArray(scheduledTransaction.upcomingInstances);
			upcomingInstancesMap[scheduledTransaction.entityId] = upcomingInstances;
		});

		// We want to ensure that the "upcomingTransaction" values for all previous months are set to 0.
		// We are only going to do this on the first run, and not on subsequent runs
		if(this.firstRun == true) {

			while(month.isBefore(currentMonth)) {
				_.forEach(subCategoryIds, (subCategoryId)=>{

					// Check in the existing values. If we have a non-zero value in the database, then that needs to be updated
					var monthlySubCategoryBudgetId = KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month);
					var existingMonthlySubCategoryBudgetValues = monthlySubCategoryBudgetsMap[monthlySubCategoryBudgetId];
					// There is no existing value, or it is different from the new value that we have determined
					if(!existingMonthlySubCategoryBudgetValues || existingMonthlySubCategoryBudgetValues.upcomingTransactions != 0) {

						upcomingTransactionResults.push({
							monthlySubCategoryBudgetId: monthlySubCategoryBudgetId,
							upcomingTransactions: 0,
							upcomingTransactionsCount: 0
						});
					}
				});

				// Move to the next month
				month.addMonths(1);
			}
		}
		else {
			// Jump directly to the current month and continue processing from there
			month = currentMonth.clone();
		}

		// We are now going to start iterating through months, starting from current month, and ending at end month
		while (month.isBefore(endMonth) || month.equalsByMonth(endMonth)) {

			// This saves the accumulated amount for upcoming transactions against subcategory ids for the current month
			var upcomingTransactionsMap:SimpleObjectMap<{value:number, count:number}> = {};
			var addUpcomingTransactionAmountForCategory = (amount:number, subCategoryId:string):void => {
				// If we already have an entry in the upcomingTransactionsMap for this category, then add the
				// amount of this scheduled subtransaction to that existing amount. Otherwise create an entry in
				// it with the passed amount.
				var upcomingTransactionsObj = upcomingTransactionsMap[subCategoryId];
				if(!upcomingTransactionsObj) {

					upcomingTransactionsObj = { value: 0, count: 0};
					upcomingTransactionsMap[subCategoryId] = upcomingTransactionsObj;
				}

				upcomingTransactionsObj.value += amount;
				upcomingTransactionsObj.count += 1;
			};

			// Iterate through all the scheduled transactions and update the amounts for upcoming transactions by category id
			_.forEach(data.scheduledTransactions, (scheduledTransaction:budgetEntities.IScheduledTransaction)=> {

				// We only calculate upcoming transactions for scheduled transactions that are in onBudget account
				var transactionAccountId = scheduledTransaction.accountId;
				var isTransactionInOnBudgetAccount = data.accountsOnBudgetMap[transactionAccountId];
				
				if(scheduledTransaction.isTombstone == 0 && isTransactionInOnBudgetAccount) {

					var upcomingInstances = upcomingInstancesMap[scheduledTransaction.entityId];
					_.forEach(upcomingInstances, (upcomingInstanceDate:DateWithoutTime)=> {

						// Is this upcoming instance date within the month that we are processing?
						if (month.equalsByMonth(upcomingInstanceDate)) {

							if(scheduledTransaction.subCategoryId) {
								addUpcomingTransactionAmountForCategory(scheduledTransaction.amount, scheduledTransaction.subCategoryId);
							}
							else if(!scheduledTransaction.subCategoryId) {
								addUpcomingTransactionAmountForCategory(scheduledTransaction.amount, data.uncategorizedSubCategoryId);
							}
						}
					});
				}
			});

			// The upcomingTransactionsMap now contains newly calculated "upcomingTransaction" values against subcategoryIds
			// However, it only contains values against those subcategory ids that are now in the scheduled transactions, and
			// not against those subcategory ids that were previously assigned to the scheduled transactions, but are not now.
			// Iterate through the list of subcategory ids
			_.forEach(subCategoryIds, (subCategoryId)=>{

				// Do we have a new upcomingTransaction value calculated for this subcategoryId?
				var upcomingTransactions = upcomingTransactionsMap[subCategoryId];
				// If no new value is found, then this should be 0.
				if(!upcomingTransactions)
					upcomingTransactions = { value: 0, count: 0};

				// Now check in the existing values. If we have a different value in the database, then that needs to be updated
				var monthlySubCategoryBudgetId = KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month);
				var existingMonthlySubCategoryBudgetValues = monthlySubCategoryBudgetsMap[monthlySubCategoryBudgetId];
				// There is no existing value, or it is different from the new value that we have determined
				if(!existingMonthlySubCategoryBudgetValues 
					|| existingMonthlySubCategoryBudgetValues.upcomingTransactions != upcomingTransactions.value
					|| existingMonthlySubCategoryBudgetValues.upcomingTransactionsCount != upcomingTransactions.count) {

					upcomingTransactionResults.push({
						monthlySubCategoryBudgetId: monthlySubCategoryBudgetId,
						upcomingTransactions: upcomingTransactions.value,
						upcomingTransactionsCount: upcomingTransactions.count
					});
				}
			});

			// Move to the next month
			month.addMonths(1);
		}

		return upcomingTransactionResults;
	}
}