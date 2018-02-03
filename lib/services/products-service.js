
module.exports = (function (get, set, clear) {

	// ASSUMES c.selector has been set, for example, with whatever command line parameters there may have been. 
	//  Not that this class would know anything about command line parameters. It just assumes.
	selector = get('lib.objectify-selector')(c.selector)

	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	function _getProducts() {
		return exchangeService.getExchange().getProducts(); 
	}

	theService.getProducts = function() {
		return _getProducts();
	}

	theService.getSelectedProduct = function() {
	    var rtn = undefined;

	    var products = _getProducts()
	    products.forEach(function (product) {
	      if (product.asset === selector.asset && product.currency === selector.currency) {
	        rtn = product
	      }
	    })

	    return rtn;
	}

	return theService;
})