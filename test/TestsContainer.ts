/// <reference path="../typings/index.d.ts" />

// Set the node environment to 'test'
process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import { PersistenceManager } from '../app/persistence/PersistenceManager';

//Let's make sure we do include the stack trace
chai.config.includeStack = true; // turn on stack trace

describe("ENAB Unit Tests", function() {

	before(function() {

		// Create and Initialize the PersistenceManager
		var persistenceManager = PersistenceManager.getInstance();
	});

	it("Runs the unit test", ()=> {
		var expect = chai.expect;
		expect(true);
	});
})

