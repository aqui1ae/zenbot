var service = require('../../../../lib/services/period-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')()

describe('Period Service', function() {
	var mockExchangeService = exchangeServiceFactory.get();

	normalizedSelector = 'stub.BTC-USD'
	exchangeId = 'stub'
	selectorObject = {normalized: normalizedSelector, exchange_id: exchangeId, asset: 'BTC', currency: 'USD' };

	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}

		spyOn(foo, 'get').and.returnValues(
			{},
			() => selectorObject, // conf			
			mockExchangeService
		)
	})

	it('is available', function() {
		expect(service).not.toBe(undefined);
	})

	it('returns true if a timeInMillis falls within a given Period', function() {
		var instance = service(foo.get, foo.set, foo.clear);

		var rtn = instance.isTimeWithinPeriod(time, periodObject);

		expect(rtn).toBe(true)
	})
})