var crypto = require('crypto')

module.exports = (function (get, set, clear) {

    // TODO: put this in a constants object
	FORWARD = 'forward'
	BACKWARD = 'backward'

	var theService = {};
	var resume_markers = undefined;
	var direction = BACKWARD;

	collectionService = get('lib.collection-service')(get, set, clear)

    marker = {
      id: crypto.randomBytes(4).toString('hex'),
      selector: null,
      from: null,
      to: null,
      oldest_time: null,
      newest_time: null
    }

    function _isMarkerInitialized() {
    	return marker.selector !== null && marker.selector !== undefined
    }

	theService.init = (direction) => {
		// read the previous resume_markers.
		this.resume_markers = this.collectionService.getResumeMarkers();
		this.direction = direction || BACKWARD;
	}

    function _initMarker(trade) {
		marker.selector = trade.selector;
		marker.from = trade.trade_id;
		marker.to = marker.from
		marker.oldest_time = trade.time;
		marker.newest_time = marker.oldest_time
    }

	theService.initMarker = (trade) => {
		_initMarker(trade);
	}

	function _getDirection() {
		return direction;
	}

	theService.getDirection = () => {
		return _getDirection();
	}

	function _setMarker(trade) {
		if (this.direction === BACKWARD) {
			this.marker.from = trade.trade_id;
		} else {
			this.marker.to = trade.trade_id;
		}
	}

	theService.setMarker = (trade) => {
		return this._setMarker(trade)
	}

	theService.getMarkerBoundaryTrade = () => {
		if (_getDirection() === BACKWARD) {
			return this.marker.from
		} else {
			return this.marker.to
		}
	}

	theService.isMarkerInitialized = () => {
		return _isMarkerInitialized();
	}

	theService.getResumeMarker = (trade) => {
		var rtn = Object.assign({}, this.marker)

		if (trade !== undefined) {
			resume_markers.forEach((rm) => { 
				if ((trade.trade_id >= rm.from) && (trade.trade_id <= rm.to)) {
					this.marker = rm;
					rtn = Object.assign({}, this.marker)
				}
			})
		}

		return rtn;
	}

	function _isInPreviousRanges(trade) {
		var rtn

		resume_markers.forEach((rm) => {
			if ((trade.trade_id >= rm.from) && (trade.trade_id <= rm.to)) {
				rtn = true;
			}
		})

		return rtn;
	}


	theService.isInPreviousRanges = (trade) => {
		return this._isInPreviousRanges(trade)
	}

	theService.isInRange = (trade) => {
		var rtn = (trade.trade_id >= marker.from) && (trade.trade_id <= rm.to);

		if (!rtn) {
			rtn = this._isInPreviousRanges(trade);
		}

		return rtn;
	}

	theService.ping = (trade) => {
		if (this._isInPreviousRanges(trade)) {
			if (!this._isMarkerInitialized()) {
				this._initMarker(trade);
			}

			// merge the current marker, and the previous marker
			// there should only be one previous marker that this trade falls in. Get it.
			var rm = this.resume_markers.find({from: {$lte: trade.trade_id}, to: {$gte: trade.trade_id}});
			if (this.direction === BACKWARD)
				this.marker.from = rm.from;
			else if (this.direction === FORWARD)
				this.marker.to = rm.to

			//delete the previous marker
			this.resume_markers.delete({from: {$lte: trade.trade_id}, to: {$gte: trade.trade_id}});

		} else {
			if (!this._isMarkerInitialized()) {
				this._initMarker(trade);
			} else {
				this._setMarker(trade);
			}
		}

		this.resume_markers.save(marker);
	}

	return theService;
})