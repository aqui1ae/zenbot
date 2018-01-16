
module.exports = (function (get, set, clear) {

	var collectionService = get('lib.collection-service')(get, set, clear)
	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	theService.getTrades = function (opts) {
		return new Promise(function (resolve, reject) {

			//  check the database,
			collectionService.getTrades().find(opts).toArray(function (err, data) { 
				if (data.length === 0) {
					//  if not the database, then the exchange's api
					exchangeService.getExchange().getTrades(opts, function(err, results2) {
						if (err) throw err;

						// add our internal id to the trade
						results2.map((trade) => {
							trade.id = exchangeService.getSelector().normalized + "-" + trade.trade_id
						})

						resolve(results2);
					})
				} else {
					resolve(data)
				}
			})
		})
	}

	theService.getInitialOptsObject = function(startingPointTradeId, optsFunc) {
		var opts = {};

		// this method only sets the to/from criteria, to be used when making a call for trades.
		//  if you want more criteria added, for instance trades with blue stars, but no green clovers,
		// 	pass in the optsFunc, and use it to add those criteria as attributes.
		if (startingPointTradeId !== undefined && startingPointTradeId !== null) {
			// TODO: Change this to use the exchange.getDirection() method
			if (exchangeService.getExchange().historyScan == exchangeService.BACKWARD) {
				opts.from = startingPointTradeId
			} else {
				opts.to = startingPointTradeId
			}
		}

		if (typeof optsFunc == 'function') {
			opts = optsFunc(opts)
		}

		return opts;
	}

	return theService
	
})