/// <reference path="../_includes.ts" />

import { AccountCalculations } from './AccountCalculations';
import { SpendingCalculationForDebtAccounts } from './SpendingCalculationForDebtAccounts';

export class _TestsContainer {

	public static performTests():void {

		before(function() {
			console.log("********************************************************************************************");
			console.log("Calculation Tests");
			console.log("********************************************************************************************");
		});

		describe("Account Calculations:", AccountCalculations.performTests);
		describe("Spending Calculation for Debt Accounts:", SpendingCalculationForDebtAccounts.performTests);
	}
}
