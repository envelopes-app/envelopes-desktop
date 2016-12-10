/**
	 Used when you just want to use an object as a typed dictionary
		var simpleObjectMap<number> = new SimpleObjectMap<number>();
		someObj['key'] = 5;
		var someNumber : number = someObj['key'];
		error because number isn't convertible to string:
		var someString : string = someObj['key'];
	*/
export class SimpleObjectMap<V> {

	[indexer:string]:V
}