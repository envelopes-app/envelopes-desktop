import * as chai from 'chai';
import { TestsHelper } from '../utilities/TestsHelper';
import { DateWithoutTime } from '../../app/utilities';
import { SubCategoriesArray, PayeesArray } from '../../app/collections';
import { AccountTypes } from '../../app/constants'; 
import * as budgetEntities from '../../app/interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../app/interfaces/state';

export class SpendingCalculationForDebtAccounts {

	public static performTests():void {

		var expect = chai.expect;
		var testsHelper:TestsHelper;
		var checkingAccountId:string;
		var visaAccountId:string;
		var refGroceriesSubCategory:budgetEntities.ISubCategory;
		var refStartingBalancePayee:budgetEntities.IPayee;
		var refVisaSubCategory:budgetEntities.ISubCategory;
		var currentMonth = DateWithoutTime.createForCurrentMonth();

		before(function() {
			testsHelper = new TestsHelper();
			return testsHelper.initialize("SpendingCalculationForDebtAccountsTestBudget")
				.then((retVal:boolean)=>{

					// Get a reference to the "Groceries" category
					var categoriesArray:SubCategoriesArray = testsHelper.entitiesCollection.subCategories;
					refGroceriesSubCategory = categoriesArray.getSubCategoryByName("Groceries");

					// Get a reference to the Starting Balance payee
					var payeesArray:PayeesArray = testsHelper.entitiesCollection.payees;
					refStartingBalancePayee = payeesArray.getStartingBalancePayee();

					// Create a checking account and a credit card account
					var checkingAccount = testsHelper.createAccount("Checking Account - " + Date.now(), AccountTypes.Checking, true);
					checkingAccountId = checkingAccount.entityId; 
					var visaAccount = testsHelper.createAccount("Visa Account - " + Date.now(), AccountTypes.CreditCard, true);
					visaAccountId = visaAccount.entityId; 

					// Persist these accounts to the database
					return testsHelper.syncEntitiesWithDatabase({
						accounts: [checkingAccount, visaAccount]
					})
					.then((retVal:boolean)=>{
						
						// Get the debt category for the visa account
						refVisaSubCategory = testsHelper.entitiesCollection.subCategories.getDebtSubCategoryForAccount(visaAccountId);
						expect(refVisaSubCategory).to.be.ok;

						// Get the starting balance transaction for the checking account, and set the balance positive
						var transactions = testsHelper.entitiesCollection.transactions.getTransactionsForAccountByPayeeId(checkingAccountId, refStartingBalancePayee.entityId);
						expect(transactions).to.be.ok;
						expect(transactions[0]).to.be.ok;
						var startingBalanceTransaction = Object.assign({}, transactions[0]);
						startingBalanceTransaction.date = currentMonth.getUTCTime();
						startingBalanceTransaction.amount = 2000;
						return testsHelper.syncEntitiesWithDatabase({
							transactions: [startingBalanceTransaction]
						});
					})
				});

		});

		after(function() {
			testsHelper.finalize();
		});

		it("Should correctly calculate 'All Spending' and 'Budgeted Spending' values for the debt category.", function() {

			// Budget some money to the groceries category in the current month
			return testsHelper.budgetMoneyToSubCategory(refGroceriesSubCategory.entityId, 200, currentMonth)
				.then((retVal:boolean)=>{

					// Get the accounts that we created earlier
					var refCheckingAccount = testsHelper.entitiesCollection.accounts.getEntityById(checkingAccountId);
					var refVisaAccount = testsHelper.entitiesCollection.accounts.getEntityById(visaAccountId);

					// Create a spending transaction on the visa account on the first of the current month. Since the visa has 0
					// balance, all of this 50 spending will be budgeted credit spending
					var refTransaction1 = testsHelper.createTransaction(refVisaAccount, refGroceriesSubCategory, -50, null, 1);
					// Create a payment transaction that takes the credit card account positive. The visa now has a balance of +50. 
					var refTransaction2 = testsHelper.createTransaction(refCheckingAccount, null, -100, refVisaAccount, 2);
					// Create another spending transaction on the visa account. Since the visa had a +50 balance, 50 of the spending
					// will be considered cash spending, and only 25 will be considered budgeted credit spending.
					var refTransaction3 = testsHelper.createTransaction(refVisaAccount, refGroceriesSubCategory, -75, null, 3);

					return testsHelper.syncEntitiesWithDatabase({
						transactions: [refTransaction1, refTransaction2, refTransaction3]
					});
				})
				.then(()=>{

					// Get the monthly subcategory budget entity for groceries in the current month
					var monthlySubCategoryBudgetForVisa = testsHelper.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(refVisaSubCategory.entityId, currentMonth.toISOString());
					expect(monthlySubCategoryBudgetForVisa.allSpending, "All Spending value is incorrect.").to.be.equal(-75);
					expect(monthlySubCategoryBudgetForVisa.budgetedSpending, "Budgeted Spending value is incorrect.").to.be.equal(-75);
				});
		});
	}
}