export class TransactionSources {

	// Manually entered transactions.
	public static None: string                   = null;

	// Transactions that were generated from scheduled transactions by the scheduler
	public static Scheduler: string              = "Scheduler";

	// Transaction that was imported but did not duplicate a
	// manually entered transaction, or a matched transaction
	// that has been "accepted".
	public static Imported: string               = "Imported";

	// Transaction matched to an existing transaction, but
	// no accept / reject decision made yet by user.
	public static Matched: string                = "Matched";
}