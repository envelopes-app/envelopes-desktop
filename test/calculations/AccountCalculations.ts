/// <reference path='../_includes.ts' />

import * as chai from 'chai';
import { TestsHelper } from '../utilities/TestsHelper';
import { DateWithoutTime } from '../../app/utilities';
import { AccountTypes } from '../../app/constants'; 
import { SubCategoriesArray } from '../../app/collections';
import * as budgetEntities from '../../app/interfaces/budgetEntities';
import * as catalogEntities from '../../app/interfaces/catalogEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../app/interfaces/state';

export class AccountCalculations {

	public static performTests():void {

		var expect = chai.expect;
		var testsHelper:TestsHelper;
		var accountName:string;
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
/*
		it("Should recalculate when we change the account to be on-budget.", function() {

			// Update the onBudget flag on the account
			refAccount.setOnBudget(true);

			return testsHelper.syncBudgetData()
				.then((retVal:boolean)=>{

					// The warning count for the account should now be 1
					expect(refAccountCalculation.getWarningCount()).to.be.equal(1);
				});
		});

		it("Should recalculate when we change the transaction amount.", function() {

			// Update the transaction amount and persist it
			refTransaction.setAmount(-200);

			return testsHelper.syncBudgetData()
				.then((retVal:boolean)=>{

					// The uncleared balance should be -200, equal to the amount of the updated transaction
					expect(refAccountCalculation.getUnclearedBalance()).to.be.equal(-200);
				});
		});

		it("Should recalculate when we change the transaction subcategory.", function() {

			// Update the transaction subcategory
			refTransaction.setSubCategoryId(refSubCategory.getEntityId());

			return testsHelper.syncBudgetData()
				.then((retVal:boolean)=>{

					// The warning count should have gone to 0 as we have now assigned a subcategory to the transaction
					expect(refAccountCalculation.getWarningCount()).to.be.equal(0);
				});
		});

		it("Should recalculate when we change the transaction cleared flag.", function() {

			// Update the cleared flag on the transaction
			refTransaction.setCleared(ynab.constants.TransactionState.Cleared);

			return testsHelper.syncBudgetData()
				.then((retVal:boolean)=>{

					// The cleared and uncleared balances should have been updated
					expect(refAccountCalculation.getUnclearedBalance()).to.be.equal(0);
					expect(refAccountCalculation.getClearedBalance()).to.be.equal(-200);
				});
		});
		
		it("Should not include raw_import or matched_import transaction amounts.", function() {

			var date = ynab.utilities.DateWithoutTime.createForToday();
			// Create a new transaction in the account that we created
			refTransaction = testUtilities.createTransaction(refAccountTransactionsViewModel, refAccount, null, -100, null);
			refTransaction.setSource(ynab.constants.TransactionSource.RawImport);
			
			var matchedImportTransaction = testUtilities.createTransaction(refAccountTransactionsViewModel, refAccount, null, -75, null);
			matchedImportTransaction.setSource(ynab.constants.TransactionSource.MatchedImport);

			return testsHelper.syncBudgetData()
				.then((retVal:boolean)=>{

					// The warning count for the account should be 0
					expect(refAccountCalculation.getWarningCount()).to.be.equal(0);
					// The uncleared balance should be 0 b/c it should not import either import transaction amount.
					expect(refAccountCalculation.getUnclearedBalance()).to.be.equal(0);
				});
		});*/
	}
}