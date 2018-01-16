var minimist = require('minimist')
	, tb = require('timebucket')
	, moment = require('moment')

module.exports = function container (get, set, clear) {

	var c = get('conf') || {}

	return function(program) {
	    program
	      .command('backfill [selector]')
	      .description('download historical trades for analysis')
	      .option('-d, --days <days>', 'number of days to acquire (default: ' + c.days + ')', Number, c.days)
	      .action(function (selector, cmd) {
		        var s = {options: minimist(process.argv)}
		        var so = s.options
		        delete so._
		        Object.keys(c).forEach(function (k) {
		          if (typeof cmd[k] !== 'undefined') {
		            so[k] = cmd[k]
		          }
		        })

	        	c.selector = get('lib.objectify-selector')(selector || c.selector)

	        	var exchangeName = get('lib.exchange-service')(get, set, clear).getExchange().name; // TODO: Refactor all exchanges to be in the format of the stub.exchange, so we can use getName() here.
	      		var msg = "Hitting up the exchange '" + exchangeName + "' for trades within the past " + so.days + " day"; if (so.days > 1) {msg += "s."} else {msg += "."}

	      		console.log("*************************")
	      		console.log(msg)
	      		console.log("*************************")
	      		console.log("\n\nBackfilling...\n\n");

	      		var targetTime = tb(new Date().getTime()).resize('3m').subtract(so.days).toMilliseconds()
	      		console.log(targetTime)

      			get('commands.backfill.backfillFunction')(targetTime).then(
      				(finalTradeId) => { 
      					process.stdout.write("\n\n");
      					// TODO: Make this say: "Done. Last processed trade happened on January 37, 2018 10:02 
      					console.log("final trade id ==> [" + JSON.stringify(finalTradeId) + "]")
      					process.exit(); 
      				},
      				(err) => { 
      					console.log("error. " + err)
      				}
      			);
			})
	}
}