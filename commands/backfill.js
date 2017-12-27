var minimist = require('minimist')
	, tb = require('timebucket')

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

	      		var targetTime = tb(new Date().getTime()).resize('1d').subtract(so.days).toMilliseconds()

	      		debugger

	      		func = get('commands.backfillFunction')(targetTime);
			})
	}

}