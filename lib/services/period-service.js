var tb = require('timebucket')

module.exports = function (/*conf*/) {

  var theService = {}

  var currPeriod = {}

  theService.init = function(trade, periodLength) {
    var d = tb(trade.time).resize(periodLength)
    currPeriod = {
      period_id: d.toString(),
      size: periodLength,
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

  theService.update = function(trade /*,periodLength*/) {
    currPeriod.high = Math.max(trade.price, currPeriod.high)
    currPeriod.low = Math.min(trade.price, currPeriod.low)
    currPeriod.close = trade.price
    currPeriod.volume += trade.size
    currPeriod.close_time = trade.time

    return Object.assign({}, currPeriod)		
  }

  theService.getPeriod = function() {
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

  return theService
}