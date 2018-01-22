
module.exports = (function (get, set, clear) {

	var collectionService = get('lib.collection-service')(get, set, clear)
	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	theService.getTrades = function (queryAttributes) {
		return new Promise(function (resolve, reject) {

			// console.log(JSON.stringify(queryAttributes))

			//  check the database,
			collectionService.getTrades().find(queryAttributes).limit(100).toArray(function (err, data) { 
				if (data.length === 0) {
					// console.log("no trades found in the db!!")
					//  if not the database, then the exchange's api
					exchangeService.getExchange().getTrades(queryAttributes, function(err, results2) {
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

	theService.getInitialQueryAttributes = function(initialTradeId) {
		var q = {};

		var selectorNormalized = exchangeService.getSelector().normalized;

		q.id = new RegExp("/^" + selectorNormalized + "/")
		q.trade_id = { $lt: initialTradeId }

		return q;
	}

	return theService
	
})