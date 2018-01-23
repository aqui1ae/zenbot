
module.exports = (function (get, set, clear) {

	var collectionService = get('lib.collection-service')(get, set, clear)
	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	theService.getTrades = function (tradeId, queryAttributes, exchangeAttributes) {
		if (queryAttributes === undefined)
			queryAttributes = _getInitialQueryAttributes(tradeId);

		if (exchangeAttributes === undefined)
			exchangeAttributes = _getInitialExchangeAttributes(tradeId)

		return new Promise(function (resolve, reject) {

			// console.log(JSON.stringify(queryAttributes))

			//  check the database,
			collectionService.getTrades().find(queryAttributes).limit(100).toArray(function (err, data) { 
				if (data.length === 0) {
					// console.log("no trades found in the db!!")
					//  if not the database, then the exchange's api
					exchangeService.getExchange().getTrades(exchangeAttributes, function(err, results2) {
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

	function _getInitialQueryAttributes(tradeId) {
		var q = {};

		var selectorNormalized = exchangeService.getSelector().normalized;

		q.id = new RegExp("/^" + selectorNormalized + "/")
		q.trade_id = { $lt: tradeId }

		return q;
	}

	function _getInitialExchangeAttributes(tradeId) {
		var q = {};

		if (exchangeService.getExchange().historyScan == exchangeService.BACKWARD) {
			q.to = tradeId;
		} else {
			q.from = tradeId;
		}

		q.product_id = exchangeService.getSelector().asset + "-" + exchangeService.getSelector().currency

		return q;
	}

	theService.getInitialQueryAttributes = function(tradeId) {
		return _getInitialQueryAttributes(tradeId)
	}

	theService.getInitialExchangeAttributes = function(tradeId) {
		return _getInitialExchangeAttributes(tradeId)
	}

	return theService
	
})