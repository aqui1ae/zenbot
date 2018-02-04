
module.exports = (function (get, set, clear) {

	c = get('conf')

	// ASSUMES c.selector has been set, for example, with whatever command line parameters there may have been. 
	//  Not that this class would know anything about command line parameters. It just assumes.
	var selector = get('lib.objectify-selector')(c.selector)

	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	var period = {}

	theService.init = function(trade, periodLength) {
		var d = tb(trade.time).resize(periodLength)
		period = {
        	period_id: d.toString(),
        	size: periodLength,
        	time = d.toMilliseconds();
	        open: trade.price,
	        high: trade.price,
	        low: trade.price,
	        close: trade.price,
	        volume: 0,
	        close_time: null
		}

		return Object.assign({}, period);
	}

	theService.update = function(trade, periodLength) {
		period.high = Math.max(trade.price, period.high)
		period.low = Math.min(trade.price, period.low)
		period.close = trade.price
		period.volume += trade.size
		period.close_time = trade.time

		return Object.assign({}, period);		
	}

	theService.getPeriod = function() {
		return Object.assign({}, period);;
	}

	return theService;
})