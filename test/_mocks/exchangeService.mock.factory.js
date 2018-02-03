module.exports = function () {
	var theFactory = {} 

	/*
		By default, returns a mock exchange service, which has
		a backward history scan, and returns two mock trades.
	*/

	theFactory.get = (opts) => {
		var selectorObject = {normalized: 'stub.BTC-USD', exchange_id: 'stub' };
		
		if (opts === undefined) 
			opts = { }

		var rtn = {
			BACKWARD: 'backward',
			FORWARD: 'forward',
			getSelector: () => { return selectorObject; },
			getExchange: undefined
		} // exchange service

		var getTradesFunc;
		if (opts.getTradesFunc !== undefined && opts.getTradesFunc !== null)
			getTradesFunc = opts.getTradesFunc;
		else
			getTradesFunc = (opts, func) => { func(null, [{trade_id: 3000}, {trade_id: 3001}]) };

		var getProductsFunc;
		if (opts.getProductsFunc !== undefined && opts.getProductsFunc !== null)
			getProductsFunc = opts.getProductsFunc;
		else
			getProductsFunc = () => { return [{
    			"asset": "BCH",
    			"currency": "BTC",
    			"min_size": "0.01",
    			"max_size": "200",
    			"increment": "0.00001",
    			"label": "BCH/BTC"
  			},
  			{
    			"asset": "BCH",
    			"currency": "USD",
    			"min_size": "0.01",
    			"max_size": "350",
    			"increment": "0.01",
    			"label": "BCH/USD"
  			}] };

		var direction = opts.direction || 'backward';

		rtn.getExchange = () => {
			return {
				historyScan: direction,
				getTrades: getTradesFunc,
				getProducts: getProductsFunc
				historyScanUsesTime: opts.historyScanUsesTime,
			}
		}

		return (() => rtn);
	}

	return theFactory
}
