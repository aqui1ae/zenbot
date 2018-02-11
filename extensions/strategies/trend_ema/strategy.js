var z = require('zero-fill'),
  n = require('numbro'),
  ema = require('../../../lib/ema'),
  rsi = require('../../../lib/rsi'),
  stddev = require('../../../lib/stddev')

module.exports = function (services) {
  
  var theStrategy = {}

  theStrategy.name = 'trend_ema'
  theStrategy.description = 
    'Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.',

  theStrategy.getOptions = function () {
    this.option('period', 'period length, same as --period_length', String, '2m')
    this.option('period_length', 'period length, same as --period', String, '2m')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('trend_ema', 'number of periods for trend EMA', Number, 26)
    this.option('neutral_rate', 'avoid trades if abs(trend_ema) under this float (0 to disable, "auto" for a variable filter)', Number, 'auto')
    this.option('oversold_rsi_periods', 'number of periods for oversold RSI', Number, 14)
    this.option('oversold_rsi', 'buy when RSI reaches this value', Number, 10)
  }

  var ps = services.periodService
  ps.setOptions({period_length: '2m', min_periods: 52, trend_ema: 26, neutral_rate: 'auto', oversold_rsi_periods: 14, oversold_rsi: 10})

  theStrategy.calculate = function(s) {
    var currentPeriod = ps.getCurrentPeriod()

    ema(s, 'trend_ema', ps)
    if (ps.getOption('oversold_rsi')) {
      // sync RSI display with oversold RSI periods
      ps.setOptions({rsi_periods: ps.getOption('oversold_rsi_periods')})
      rsi(s, 'oversold_rsi', ps, ps.getOption('oversold_rsi_periods'))
      if (!s.in_preroll && currentPeriod.oversold_rsi <= ps.getOption('oversold_rsi') && !s.oversold && !s.cancel_down) {
        s.oversold = true
        if (s.options.mode !== 'sim' || s.options.verbose) console.log(('\noversold at ' + currentPeriod.oversold_rsi + ' RSI, preparing to buy\n').cyan)
      }
    }

    var lookback = ps.getMostRecentlyPushedLookbackPeriod()
    if (currentPeriod.trend_ema && lookback && lookback.trend_ema) {
      currentPeriod.trend_ema_rate = (currentPeriod.trend_ema - lookback.trend_ema) / lookback.trend_ema * 100
    }
    if (s.options.neutral_rate === 'auto') {
      stddev(s, 'trend_ema_stddev', Math.floor(s.options.trend_ema / 2), 'trend_ema_rate')
    } else {
      currentPeriod.trend_ema_stddev = s.options.neutral_rate
    }

    ps.update2(currentPeriod)
  }

  theStrategy.onPeriod = function (s, cb) {
    var currentPeriod = ps.getCurrentPeriod()
    
    if (!s.in_preroll && typeof currentPeriod.oversold_rsi === 'number') {
      if (s.oversold) {
        s.oversold = false
        s.trend = 'oversold'
        s.signal = 'buy'
        s.cancel_down = true
        return cb()
      }
    }
    if (typeof currentPeriod.trend_ema_stddev === 'number') {
      if (currentPeriod.trend_ema_rate > currentPeriod.trend_ema_stddev) {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
        s.cancel_down = false
      } else if (!s.cancel_down && currentPeriod.trend_ema_rate < (currentPeriod.trend_ema_stddev * -1)) {
        if (s.trend !== 'down') {
          s.acted_on_trend = false
        }
        s.trend = 'down'
        s.signal = !s.acted_on_trend ? 'sell' : null
      }
    }
    cb()
  }

  theStrategy.onReport = function() {
    var cols = []
    var currentPeriod = ps.getCurrentPeriod()

    if (typeof currentPeriod.trend_ema_stddev === 'number') {
      var color = 'grey'
      if (currentPeriod.trend_ema_rate > currentPeriod.trend_ema_stddev) {
        color = 'green'
      } else if (currentPeriod.trend_ema_rate < currentPeriod.trend_ema_stddev * -1) {
        color = 'red'
      }
      cols.push(z(8, n(currentPeriod.trend_ema_rate).format('0.0000'), ' ')[color])
      if (currentPeriod.trend_ema_stddev) {
        cols.push(z(8, n(currentPeriod.trend_ema_stddev).format('0.0000'), ' ').grey)
      }
    } else {
      if (currentPeriod.trend_ema_stddev) {
        cols.push('                  ')
      } else {
        cols.push('         ')
      }
    }
    return cols
  }

  return theStrategy
}

