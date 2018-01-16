
/*
	Processes the trades.. 
*/

module.exports = (function (get, set, clear) {

  	var collectionService = get('lib.collection-service')(get, set, clear)
  	var exchangeService = get('lib.exchange-service')(get, set, clear)

	return (targetTimeInMillis, queue, getIDofNextTradeToProcessFunc, cb) => { 
		var trades = queue.dequeue();

		var prev
		var curr
		var rtnTrade; 
		var index = 0
		var moreInThisBatch = true
		var stopProcessingConditionReached = false

		do {
			prev = curr
			curr = trades[index++];

			if (curr === undefined) {
				rtnTrade = prev;
				moreInThisBatch = false;
			} else {
				if (curr.time > targetTimeInMillis)  {
					let skipToTradeId = getIDofNextTradeToProcessFunc(curr);

					//  if number we can skip to === currtrade
					if (skipToTradeId === curr.trade_id) {
						let lastTrade = curr;
						let idx = {i: index}
						collectionService.getTrades().insert(curr).then((err, doc) => {
							if (idx.i === trades.length) {
								// console.log(idx.i + " " + trades.length)
								cb(null, false, lastTrade.trade_id) 
							}
						})
					}
					else {
					// if number we can skip to !== currtrade
						// cb(null, false, (cb) => { 
						// 		collectionService.getTrades().find({id: skipToTradeId}).toArray(function (err, data) {
						// 			cb(data[0]) ;
						// 	})
						// })

						// console.log(curr.trade_id + " caused a skip to " + JSON.stringify(skipToTradeId))

						moreInThisBatch = false;
						cb(null, false, skipToTradeId);

						// if (moreInThisBatch) {
						// 	moreInThisBatch = false
						// 	// 	call db, and get the trade we can skip to, set currTrade to it
						// 	setImmediate((tradeId) => {
						// 		var tradeId = exchangeService.getSelector().normalized + "-" + skipToTradeId;
						// 		collectionService.getTrades().find({id: tradeId}).toArray(function (err, data) {
						// 			console.log("---=-=-=-= " + JSON.stringify(data[0]))
						// 			cb(null, false, data[0])
						// 		})
						// 	})
						// }
					}
				} else {
					// this is past our time limit...
					moreInThisBatch = false;
					stopProcessingConditionReached = true;
					rtnTrade = prev || curr;
				}
			} 

		} while (moreInThisBatch);

		if (stopProcessingConditionReached) {
			// console.log("2222222")
			cb(null, stopProcessingConditionReached, rtnTrade.trade_id)
		}
	}

})