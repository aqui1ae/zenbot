var crypto = require('crypto')
	, tb = require('timebucket')

module.exports = (function (get, set, clear) {

    marker = {
      id: crypto.randomBytes(4).toString('hex'),
      selector: null,
      from: null,
      to: null,
      oldest_time: null,
      newest_time: null
    }

    mode = undefined;
    selectorObj = undefined;

    target_time = undefined;
    start_time = undefined;

    collectionService = get('lib.collection-service')(get, set, clear)

    // TODO: put this in a constants object
	FORWARD = 'forward'
	BACKWARD = 'backward'


	return {

		getMarker: () => {
			return Object.assign({}, marker)
		},

		getTargetTime: () => {
			return target_time;
		},

		init: (mode, selectorObj, days) => {
			debugger
			// set mode
			if (mode == this.FORWARD || mode == this.BACKWARD)
				this.mode = mode
			else
				this.mode = undefined

			// set selector
			this.selectorObj = selectorObj
			this.marker.selector = selectorObj.normalized

	        // set target_time and start_time
	        if (this.mode === this.BACKWARD) {
	          target_time = new Date().getTime() - (86400000 * days)
	        }
	        else {
	          target_time = new Date().getTime()
	          start_time = new Date().getTime() - (86400000 * days)
	        }
		},

		getPreviousMarkers: () => {
			var self = this;
			return new Promise((resolve, reject) => {
				collectionService.getResumeMarkers().select({query: {selector: marker.selector}}, function(err, markers) {
					if (err) throw err
			        // TODO: can't this be done in the query?
			        markers.sort(function (a, b) {
			          if (self.mode === self.BACKWARD) {
			            if (a.to > b.to) return -1
			            if (a.to < b.to) return 1
			          }
			          else {
			            if (a.from < b.from) return -1
			            if (a.from > b.from) return 1
			          }
			          return 0
			        })

			        resolve(markers)
				});
			})
		},

		updateMarkerBasedOnAnotherMarker: (other_marker) => {
            // for backward scan, if the oldest_time is within another marker's range, skip to the other marker's start point.
            // for forward scan, if the newest_time is within another marker's range, skip to the other marker's end point.
            if (this.mode === this.BACKWARD && marker.id !== other_marker.id && marker.from <= other_marker.to && marker.from > other_marker.from) {
              marker.from = other_marker.from
              marker.oldest_time = other_marker.oldest_time
            }
            else if (mode !== this.BACKWARD && marker.id !== other_marker.id && marker.to >= other_marker.from && marker.to < other_marker.to) {
              marker.to = other_marker.to
              marker.newest_time = other_marker.newest_time
            }
		},

		updateMarkerBasedOnTrade: (cursor, trade) => {
			if (this.mode === this.BACKWARD) {
              if (!marker.to) {
                marker.to = cursor
                marker.oldest_time = trade.time
                marker.newest_time = trade.time
              }
              marker.from = marker.from ? Math.min(marker.from, cursor) : cursor
              marker.oldest_time = Math.min(marker.oldest_time, trade.time)
            } 
            else {
              if (!marker.from) {
                marker.from = cursor
                marker.oldest_time = trade.time
                marker.newest_time = trade.time
              }
              marker.to = marker.to ? Math.max(marker.to, cursor) : cursor
              marker.newest_time = Math.max(marker.newest_time, trade.time)
          }
		},

		getExchangeTradeQueryOpts: (exchange) => {
			var rtn = {product_id: selectorObj.product_id};

            if (mode === this.BACKWARD) {
              rtn.to = marker.from
            }
            else {
              if (marker.to) rtn.from = marker.to + 1
              else rtn.from = exchange.getCursor(start_time)
            }

        	return rtn
		},

		saveNewMarker: (marker) => {
			var self = this;
			return new Promise((resolve, reject) => {
				collectionService.getResumeMarkers().save(marker, function(err, markers) {
					resolve(err)
				})
			})
		},

		getNumberOfHoursOfPreviouslyCollectedDataSkipped: (prevMarker) => {
			hrs = undefined;

			if (mode === this.BACKWARD && prevMarker.oldest_time !== marker.oldest_time)
				hrs = tb(prevMarker.oldest_time - marker.oldest_time).resize('1h').value
			else if (mode === this.FORWARD && prevMarker.newest_time !== marker.newest_time)
				hrs = tb(marker.newest_time - prevMarker.newest_time).resize('1h').value
			
			return hrs;
		},

		getCurrentDaysLeft: () => {
			return 1 + (
				mode === 'backward' ? 
				tb(marker.oldest_time - target_time).resize('1d').value : 
				tb(target_time - marker.newest_time).resize('1d').value
			)
		},

		isDownloadComplete: () => {
			if (mode === this.BACKWARD)
				return (marker.oldest_time <= target_time)
			else
				return false;
		}

	}

})

