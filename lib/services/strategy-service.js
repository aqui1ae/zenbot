
module.exports = (function (get, set, clear) {

	c = get('conf')

	// ASSUMES c.selector has been set, for example, with whatever command line parameters there may have been. 
	//  Not that this class would know anything about command line parameters. It just assumes.
	var selector = get('lib.objectify-selector')(c.selector)

	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	theService.getSelectedStrategy = function() {
		var rtn;

		rtn = get('strategies.' + c.strategy)
	}

	return theService;
})