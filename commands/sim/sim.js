var tb = require('timebucket')
  , minimist = require('minimist')
  // , n = require('numbro')
  // , fs = require('fs')
  , path = require('path')
  , moment = require('moment')
  // , colors = require('colors')
  , objectifySelector = require('../lib/objectify-selector')  

module.exports = function (program, conf) {
  var c = conf

  program
    .command('sim [selector]')
    .allowUnknownOption()
    .description('run a simulation on backfilled data')
    .option('--conf <path>', 'path to optional conf overrides file')
    .option('--strategy <name>', 'strategy to use', String, c.strategy)
    .option('--order_type <type>', 'order type to use (maker/taker)', /^(maker|taker)$/i, c.order_type)
    .option('--filename <filename>', 'filename for the result output (ex: result.html). "none" to disable', String, c.filename)
    .option('--start <datetime>', 'start ("YYYYMMDDhhmm")')
    .option('--end <datetime>', 'end ("YYYYMMDDhhmm")')
    .option('--days <days>', 'set duration by day count', Number, c.days)
    .option('--currency_capital <amount>', 'amount of start capital in currency', Number, c.currency_capital)
    .option('--asset_capital <amount>', 'amount of start capital in asset', Number, c.asset_capital)
    .option('--avg_slippage_pct <pct>', 'avg. amount of slippage to apply to trades', Number, c.avg_slippage_pct)
    .option('--buy_pct <pct>', 'buy with this % of currency balance', Number, c.buy_pct)
    .option('--sell_pct <pct>', 'sell with this % of asset balance', Number, c.sell_pct)
    .option('--markdown_buy_pct <pct>', '% to mark down buy price', Number, c.markdown_buy_pct)
    .option('--markup_sell_pct <pct>', '% to mark up sell price', Number, c.markup_sell_pct)
    .option('--order_adjust_time <ms>', 'adjust bid/ask on this interval to keep orders competitive', Number, c.order_adjust_time)
    .option('--sell_stop_pct <pct>', 'sell if price drops below this % of bought price', Number, c.sell_stop_pct)
    .option('--buy_stop_pct <pct>', 'buy if price surges above this % of sold price', Number, c.buy_stop_pct)
    .option('--profit_stop_enable_pct <pct>', 'enable trailing sell stop when reaching this % profit', Number, c.profit_stop_enable_pct)
    .option('--profit_stop_pct <pct>', 'maintain a trailing stop this % below the high-water mark of profit', Number, c.profit_stop_pct)
    .option('--max_sell_loss_pct <pct>', 'avoid selling at a loss pct under this float', c.max_sell_loss_pct)
    .option('--max_slippage_pct <pct>', 'avoid selling at a slippage pct above this float', c.max_slippage_pct)
    .option('--symmetrical', 'reverse time at the end of the graph, normalizing buy/hold to 0', c.symmetrical)
    .option('--rsi_periods <periods>', 'number of periods to calculate RSI at', Number, c.rsi_periods)
    .option('--disable_options', 'disable printing of options')
    .option('--enable_stats', 'enable printing order stats')
    .option('--backtester_generation <generation>','creates a json file in simulations with the generation number', Number, -1)
    .option('--verbose', 'print status lines on every period')
    .action(function (selector, cmd) {
      var s = {options: minimist(process.argv)}
      var so = s.options
      delete so._
      Object.keys(c).forEach(function (k) {
        if (typeof cmd[k] !== 'undefined') {
          so[k] = cmd[k]
        }
      })

      if (so.start) {
        so.start = moment(so.start, 'YYYYMMDDhhmm').valueOf()
        if (so.days && !so.end) {
          so.end = tb(so.start).resize('1d').add(so.days).toMilliseconds()
        }
      }
      if (so.end) {
        so.end = moment(so.end, 'YYYYMMDDhhmm').valueOf()
        if (so.days && !so.start) {
          so.start = tb(so.end).resize('1d').subtract(so.days).toMilliseconds()
        }
      }
      if (!so.start && so.days) {
        var d = tb('1d')
        so.start = d.subtract(so.days).toMilliseconds()
      }
      so.days = moment(so.end).diff(moment(so.start), 'days')

      so.stats = !!cmd.enable_stats
      so.show_options = !cmd.disable_options
      so.verbose = !!cmd.verbose
      so.selector = objectifySelector(selector || c.selector)
      so.mode = 'sim'

      if (cmd.conf) {
        var overrides = require(path.resolve(process.cwd(), cmd.conf))
        Object.keys(overrides).forEach(function (k) {
          so[k] = overrides[k]
        })
      }
    })
}

