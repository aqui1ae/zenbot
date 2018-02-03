var service = require('../../../../lib/services/products-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')()

describe('Products Service', function() {
	var mockExchangeService = exchangeServiceFactory.get();

	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}

		spyOn(foo, 'get').and.returnValues(
			mockExchangeService
		)
	})

	it('is available', function() {
		expect(service).not.toBe(undefined);
	})

	it('returns a list of the current exchanges products', function() {
		var instance = service(foo.get, foo.set, foo.clear);

		var rtn = instance.getProducts();

		expect(rtn.length).toBe(2);
		expect(rtn[0].asset).toBe("BCH")
		expect(rtn[0].currency).toBe("BTC")
		expect(rtn[0].min_size).toBe("0.01")
		expect(rtn[0].max_size).toBe("200")
		expect(rtn[0].increment).toBe("0.00001")
		expect(rtn[0].label).toBe("BCH/BTC")
		expect(rtn[1].asset).toBe("BCH")
		expect(rtn[1].currency).toBe("USD")
		expect(rtn[1].min_size).toBe("0.01")
		expect(rtn[1].max_size).toBe("350")
		expect(rtn[1].increment).toBe("0.01")
		expect(rtn[1].label).toBe("BCH/USD")
	})
})