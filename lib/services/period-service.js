var tb = require('timebucket')

module.exports = function (/*conf*/) {

  var theService = {}

  var currPeriod = {}

  var lookback = []

  var options = {}

  theService.getOption = function(name) {
    return options[name]
  }

  theService.setOptions = function(obj) {
    options = Object.assign({}, options, obj)
  }

  theService.init = function(trade) {
    
    var d = tb(trade.time).resize(options['period_length'])
    currPeriod = {
      period_id: d.toString(),
      size: options['period_length'],
      time: d.toMilliseconds(),
      open: trade.price,
      high: trade.price,
      low: trade.price,
      close: trade.price,
      volume: 0,
      close_time: null
    }

    return Object.assign({}, currPeriod)
  }

  theService.update = function(trade) {
    if (currPeriod === undefined || currPeriod == null)
      throw new Error('PeriodService has not been initialized.')

    currPeriod.high = Math.max(trade.price, currPeriod.high)
    currPeriod.low = Math.min(trade.price, currPeriod.low)
    currPeriod.close = trade.price
    currPeriod.volume += trade.size
    currPeriod.close_time = trade.time

    return Object.assign({}, currPeriod)		
  }

  theService.update2 = function(period) {
    currPeriod = Object.assign({}, currPeriod, period)
    return currPeriod
  }

  theService.setFieldOnCurrentPeriod = function(name, value) {
    currPeriod[name] = value
  }

  theService.getCurrentPeriod = function() {
    return Object.assign({}, currPeriod)
  }

  function _isTimeWithinPeriod(timeInMillis, period) {
    let period_id = tb(timeInMillis).resize(period.size).toString()
    return period_id == period.period_id
  }

  theService.isTimeWithinPeriod = function(timeInMillis, period) {
    var tmpPeriod = currPeriod

    if (period !== undefined)
      tmpPeriod = period

    return _isTimeWithinPeriod(timeInMillis, tmpPeriod)
  }

  theService.isTimeWithinCurrentPeriod = function(timeInMillis) {
    return _isTimeWithinPeriod(timeInMillis, currPeriod)
  }

  theService.getPeriodIdForTimeInMillis = function(timeInMillis) {
    return tb(timeInMillis).resize(currPeriod.size).toString()
  }

  theService.pushCurrentPeriodToLookback = function() {
    lookback.unshift(currPeriod)
  }

  theService.getMostRecentlyPushedLookbackPeriod = function() {
    var rtn = undefined

    if (lookback.length > 0)
      rtn = Object.assign({}, lookback[0])

    return rtn
  }

  theService.getLookback = function() {
    return lookback.slice(0, lookback.length)
  }

  /* TODO: Test these 4 methods! */
  // theService.setPeriodLength = function(pl) {
  //   periodLength = pl
  // }

  theService.getPeriodLength = function() {
    return options['period_length']
  }

  theService.getCurrentGain = function() {
    return currPeriod.close - lookback[0].close
  }

  theService.getCurrentLoss = function() {
    return lookback[0].close - currPeriod.close
  }

  return theService
}