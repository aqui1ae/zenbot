module.exports = function container (get, set, clear) {

	return function (targetTimeInMillis) {
		
		collectionService = get('lib.collection-service')(get, set, clear)
	  	tradesService = get('lib.trades-service')(get, set, clear)
	  	resumeMarkerService = get('lib.resume-marker-service')(get, set, clear)

		moreToProcess = true;
		// processing = false;
		prm = undefined

		debugger
		//while (moreToProcess) {
			// if (!processing) {
				// processing = true
				
				if (prm === undefined) {
					debugger
					tradesService.getTrades( resumeMarkerService.getMarkerBoundaryTrade() ).then(function (trades) {
						debugger
						console.log("in backfillFunction callback")
						var moreTrades;
						var index = -1;

						// WILO: Need to design some fake DB trade data to test with
						//  probably a server which serves trades that fit a certain scenario
						//  For now, just a bunch of trades will do. But later, trades 
						//  to test that the bot makes the expected decision.

						do {
							moreTrades = trades && (index + 1) < trades.length;

							if (moreTrades) {
								index++;

								if (this.resumeMarkerService.isInRange(trades[index])) {
									// assume we have these already
									moreTrades = false
								}
								else {
									if (trades[index].time > targetTimeInMillis) {
										this.collectionService.getTrades().save(trades[index])
										this.resumeMarkerService.ping(trades[index])
									}
									else {
										moreTrades = false;
										moreToProcess = false;
									}
								}
							}
						} while (moreTrades)

						// processing = false;
						prm = undefined;
					}, function (err) {
						console.log("Something bad happened. ")
						console.log(err)
					})
				}
		//	}
		// }
	}
}