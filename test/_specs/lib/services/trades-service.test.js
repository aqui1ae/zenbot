var service = require('../../../../lib/services/trades-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')()
var collectionServiceFactory = require('../../../../test/_mocks/collectionService.mock.factory')()

describe('Trades Service', function() {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}
	})
 
	describe('when exchange is backward, ', function() {

		var mockExchangeService = exchangeServiceFactory.get();
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		})

		it('returns a valid opts object with default params', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialOptsObject()

			expect(rtn).toBeDefined();
			expect(rtn).toEqual({})
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).not.toBeDefined()			
		})

		it('returns a valid opts object when startingTradeId is given but optsFunc is not', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialOptsObject(100)

			expect(rtn).toBeDefined();
			expect(rtn.from).toBe(100)
			expect(rtn.to).not.toBeDefined()
		})

		it('returns a valid opts object when startingTradeId is given and optsFunc is passed in', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialOptsObject(100, (opts, selector) => { opts.foo = "foo"; return opts; })

			expect(rtn).toBeDefined();
			expect(rtn.from).toBe(100)
			expect(rtn.to).not.toBeDefined()
			expect(rtn.foo).toBe("foo")
		})
	})

	describe('when exchange is forward, ', function() {

		var opts = {direction: 'forward'};
		var mockExchangeService = exchangeServiceFactory.get(opts);
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		})

		it('returns a valid opts object with default params', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialOptsObject()

			expect(rtn).toBeDefined();
			expect(rtn).toEqual({})
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).not.toBeDefined()			
		})

		it('returns a valid opts object when startingTradeId is given but optsFunc is not', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialOptsObject(100)

			expect(rtn).toBeDefined();
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).toBe(100)
		})

		it('returns a valid opts object when startingTradeId is given and optsFunc is passed in', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialOptsObject(100, (opts, selector) => { opts.foo = "foo"; return opts; })

			expect(rtn).toBeDefined();
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).toBe(100)
			expect(rtn.foo).toBe("foo")
		})
	})

	describe('getTrades when DB returns nothing, and API returns two trades', function() {

		var mockExchangeService = exchangeServiceFactory.get();
		var mockCollectionService = collectionServiceFactory.get({tradesArray: [ ]});

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('calls getTrades correctly', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var nomalizedSelector = mockExchangeService().getSelector().normalized;

			instance.getTrades().then((data) => {
				expect(data.length === 2).toBe(true)
				expect(data[0].id).toEqual(normalizedSelector + "-" + 3000)
				expect(data[1].id).toEqual(normalizedSelector + "-" + 3001)
				done();
			})
		})
	})

	describe('getTrades when DB returns two trades, and API returns no trades', function() {

		var mockExchangeService = exchangeServiceFactory.get({getTradesFunc: (opts, func) => { }, direction: 'forward'});
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('calls getTrades correctly', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var nomalizedSelector = mockExchangeService().getSelector().normalized;

			instance.getTrades().then((data) => {
				expect(data.length === 2).toBe(true)
				expect(data[0].id).toEqual(normalizedSelector + "-" + 3000)
				expect(data[1].id).toEqual(normalizedSelector + "-" + 3001)
				done();
			})
		})
	})
})