
module.exports = (function (get, set, clear) {

	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	theService.getProducts = function() {
		return exchangeService.getExchange().getProducts();
	}

	return theService;
})