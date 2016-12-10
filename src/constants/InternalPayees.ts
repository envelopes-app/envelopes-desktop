export class InternalPayees {

	public static ManualBalanceAdjustment           : string = "BalanceAdjustmentPayee";
	public static ReconciliationBalanceAdjustment   : string = "BalanceAdjustmentReconcilePayee";
	public static StartingBalance                   : string = "StartingBalancePayee";

	public static getNameForInternalPayee(internalName: string): string {
		switch(internalName){
			case InternalPayees.StartingBalance:
				return "Starting Balance";

			case InternalPayees.ManualBalanceAdjustment:
				return "Manual Balance Adjustment";

			case InternalPayees.ReconciliationBalanceAdjustment:
				return "Reconciliation Balance Adjustment";
		}
		return "";
	}
}