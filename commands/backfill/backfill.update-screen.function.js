var Moment = require('moment')

module.exports = (function (get, set, clear) {

  	var exchangeService = get('lib.exchange-service')(get, set, clear)

	return (trade, queue, cb) => { 
		var now = new Date().getTime();
		// var exhange = exchangeService.getExchange()

		// var number;

		// TODO: phase out in favor of calling exchange.getDirection()
		// if (exchange.historyScan === 'backward')
		// 	number = now - trade.time;
		// else
		// 	number = foo;

		process.stdout.clearLine();
		process.stdout.write("Processed trades up to " + Moment(trade.time).fromNow() + "." );
		process.stdout.cursorTo(0);
		// process.stdout.write("\n");
	}

})
