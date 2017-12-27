
module.exports = (function (get, set, clear) {

	return {
		getExchange: (exchangeId) => {
			return get('exchanges.' + exchangeId)
		}
	}

})