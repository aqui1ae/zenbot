module.exports = function container (get, set, clear) {

	return function (targetTimeInMillis) {
		
		collectionService = get('lib.collection-service')(get, set, clear)
	  	tradesService = get('lib.trades-service')(get, set, clear)
	  	resumeMarkerService = get('lib.resume-marker-service')(get, set, clear)

		moreToProcess = true;
		processing = false;

		while (moreToProcess) {
			debugger
			if (!processing) {
				processing = true
				debugger
				tradesService.getTrades( resumeMarkerService.getMarkerBoundaryTrade() ).then((trades) => {
					debugger
					console.log("in backfillFunction callback")
					var moreTrades;
					var index = -1;

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

					processing = false;
				})
			}
		}
	}
}