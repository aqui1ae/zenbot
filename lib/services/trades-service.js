
module.exports = (function (get, set, clear) {

	var collectionService = get('lib.collection-service')
	var exchangeService = get('lib.exchange-service')
	var exchange;

	return {

		init: (selector) => {
			exchange = exchangeService.getExchange(selector)
		},

		getTrades: (startingPointTrade, optsFunc) => {
			return new Promise((resolve, reject) => {
				// this method only sets the to/from criteria when making a call for trades.
				//  if you want more criteria added, pass in the optsFunc, and use it to add those attributes.
				var opts = {};
				if (startingPointTrade !== undefined && startingPointTrade !== null) {
					if (exchangeService.getHistoryScanDirection(selector) === exchangeService.BACKWARD) {
						opts.to = startingPointTrade
					} else {
						opts.from = startingPointTrade
					}
				}	

				if (optsFunc !== undefined) {
					opts = optsFunc(opts, selector)
				}
				
				//  check the database,
				debugger
				var coll = this.collectionService.getTrades().find(opts, (err, data) => { 
					debugger

					if (data === undefined) {
						//  if not the database, then the exchange's api
						exchange.getTrades(opts, function(err, results2) {
							if (err) throw err;

							resolve(results2);
						})
					}
				})
			}) 
		}
	}
})