/// <reference path='../_includes.ts' />

import * as chai from 'chai';
import { TestsHelper } from '../utilities/TestsHelper';
import { DateWithoutTime } from '../../app/utilities';
import { AccountTypes, ClearedFlag, TransactionSources } from '../../app/constants'; 
import { SubCategoriesArray } from '../../app/collections';
import * as budgetEntities from '../../app/interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../app/interfaces/state';

export class AccountCalculations {

	public static performTests():void {

		var expect = chai.expect;
		var testsHelper:TestsHelper;
		var accountName:string;
		var transactionId:string;
		var refSubCategory:budgetEntities.ISubCategory;

		before(function() {
			testsHelper = new TestsHelper();
			return testsHelper.initialize("AccountCalculationsTestBudget")
				.then((retVal:boolean)=>{

					// Get a reference to the "Groceries" category
					var categoriesArray:SubCategoriesArray = testsHelper.entitiesCollection.subCategories;
					refSubCategory = categoriesArray.getSubCategoryByName("Groceries");

					// Create an off-budget account that we are going to use for the tests
					accountName = "Test Account - " + Date.now();
					var refAccount = testsHelper.createAccount(accountName, AccountTypes.Checking, false);
					// Persist this account to the database
					return testsHelper.syncEntitiesWithDatabase({
						accounts: [refAccount]
					});
				});
		});

		after(function () {
			testsHelper.finalize();
		});

		it("Should recalculate when we add a new transaction.", function() {

			// Create a new transaction in the account that we created
			var refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
			var refTransaction = testsHelper.createTransaction(refAccount, null, -100);
			// Save the transactionId for later access
			transactionId = refTransaction.entityId;

			return testsHelper.syncEntitiesWithDatabase({
				transactions: [refTransaction]
			})
			.then((retVal:boolean)=>{

				refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
				// The warning count for the account should be 0
				expect(refAccount.warningCount).to.be.equal(0);
				// The uncleared balance should be -100, equal to the amount of the new transaction
				expect(refAccount.unclearedBalance).to.be.equal(-100);
			});
		});

		it("Should recalculate when we change the account to be on-budget.", function() {

			// Update the onBudget flag on the account
			var refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
			refAccount = Object.assign({}, refAccount);
			refAccount.onBudget = 1;

			return testsHelper.syncEntitiesWithDatabase({
				accounts: [refAccount]
			})
			.then((retVal:boolean)=>{

				// The warning count for the account should now be 1
				refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
				expect(refAccount.warningCount).to.be.equal(1);
			});
		});

		it("Should recalculate when we change the transaction amount.", function() {

			// Get the transaction that we created earlier, update the amount and persist it
			var refTransaction = testsHelper.entitiesCollection.transactions.getEntityById(transactionId);
			refTransaction = Object.assign({}, refTransaction);
			refTransaction.amount = -200;

			return testsHelper.syncEntitiesWithDatabase({
				transactions: [refTransaction]
			})
			.then((retVal:boolean)=>{

				// The uncleared balance should be -200, equal to the amount of the updated transaction
				var refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
				expect(refAccount.unclearedBalance).to.be.equal(-200);
			});
		});

		it("Should recalculate when we change the transaction subcategory.", function() {

			// Update the transaction subcategory
			var refTransaction = testsHelper.entitiesCollection.transactions.getEntityById(transactionId);
			refTransaction = Object.assign({}, refTransaction);
			refTransaction.subCategoryId = refSubCategory.entityId;

			return testsHelper.syncEntitiesWithDatabase({
				transactions: [refTransaction]
			})
			.then((retVal:boolean)=>{

				// The warning count should have gone to 0 as we have now assigned a subcategory to the transaction
				var refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
				expect(refAccount.warningCount).to.be.equal(0);
			});
		});

		it("Should recalculate when we change the transaction cleared flag.", function() {

			// Update the cleared flag on the transaction
			var refTransaction = testsHelper.entitiesCollection.transactions.getEntityById(transactionId);
			refTransaction = Object.assign({}, refTransaction);
			refTransaction.cleared = ClearedFlag.Cleared;

			return testsHelper.syncEntitiesWithDatabase({
				transactions: [refTransaction]
			})
			.then((retVal:boolean)=>{

				// The cleared and uncleared balances should have been updated
				var refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
				expect(refAccount.unclearedBalance).to.be.equal(0);
				expect(refAccount.clearedBalance).to.be.equal(-200);
			});
		});
		
		it("Should not include 'Matched' transaction amounts.", function() {

			var date = DateWithoutTime.createForToday();
			// Create a new transaction in the account that we created
			var refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
			var refTransaction = testsHelper.createTransaction(refAccount, null, -100);
			refTransaction.source = TransactionSources.Matched;
			refTransaction.matchedTransactionId = transactionId;
			
			return testsHelper.syncEntitiesWithDatabase({
				transactions: [refTransaction]
			})
			.then((retVal:boolean)=>{

				var refAccount = testsHelper.entitiesCollection.accounts.getAccountByName(accountName);
				// The warning count for the account should be 0
				expect(refAccount.warningCount).to.be.equal(0);
				// The uncleared balance should be 0 b/c it should not consider the newly created matched transaction
				expect(refAccount.unclearedBalance).to.be.equal(0);
			});
		});
	}
}