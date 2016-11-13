declare function openDatabase(name:string, version:string, displayName:string, estimatedSize:number, creationCallback?:DatabaseCallback):Database;

interface DatabaseCallback {
    (refDatabase:Database):void;
}

// *********************************************************************************************************************************
// Database
// *********************************************************************************************************************************
interface Database {

    transaction(callback:SQLTransactionCallback, errorCallback?:SQLTransactionErrorCallback, successCallback?:SQLVoidCallback):void;
    readTransaction(callback:SQLTransactionCallback, errorCallback?:SQLTransactionErrorCallback, successCallback?:SQLVoidCallback):void;
    changeVersion(oldVersion:string, newVersion:string, callback?:SQLTransactionCallback, errorCallback?:SQLTransactionErrorCallback, successCallback?:SQLVoidCallback):void;
}

interface SQLTransactionCallback {
    (refTransaction:SQLTransaction):void;
}

interface SQLTransactionErrorCallback {
    (error:SQLError):void;
}

interface SQLVoidCallback {
    ():void;
}

interface SQLError {
    code: number;
    message: string;
}

// *********************************************************************************************************************************
// SQLTransaction
// *********************************************************************************************************************************
interface SQLTransaction {
    executeSql(sqlStatement:string, arguments?:Array<any>, callback?:SQLStatementCallback, errorCallback?:SQLStatementErrorCallback):void;
}

interface SQLStatementCallback {
    (transaction:SQLTransaction, resultSet:SQLResultSet):void;
}

interface SQLStatementErrorCallback {
    (transaction:SQLTransaction, error:SQLError):boolean;
}

// *********************************************************************************************************************************
// SQLResultSet
// *********************************************************************************************************************************
interface SQLResultSet {
    insertId: number;
    rowsAffected: number;
    rows: SQLResultSetRowList;
}

interface SQLResultSetRowList {
    length: number;
    item(i:number):any;
}