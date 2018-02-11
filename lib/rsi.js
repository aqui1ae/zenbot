
module.exports = function rsi (s, key, periodService, length) {
  let lookback = periodService.getLookback()

  if (lookback.length >= length) {
    var mostRecentLookback = lookback[0]

    var avg_gain = mostRecentLookback[key + '_avg_gain']
    var avg_loss = mostRecentLookback[key + '_avg_loss']

    if (typeof avg_gain === 'undefined') {
      var gain_sum = 0
      var loss_sum = 0
      var last_close
      lookback.forEach(function (period) {
        if (last_close) {
          if (period.close > last_close) {
            gain_sum += period.close - last_close
          }
          else {
            loss_sum += last_close - period.close
          }
        }
        last_close = period.close
      })

      periodService.setFieldOnCurrentPeriod(key + '_avg_gain', gain_sum / length)
      periodService.setFieldOnCurrentPeriod(key + '_avg_loss', loss_sum / length)
    }
    else {
      var current_gain = periodService.getCurrentGain()
      periodService.setFieldOnCurrentPeriod(key + '_avg_gain', ((avg_gain * (length - 1)) + (current_gain > 0 ? current_gain : 0)) / length)

      var current_loss = periodService.getCurrentLoss()
      periodService.setFieldOnCurrentPeriod(key + '_avg_loss', ((avg_loss * (length - 1)) + (current_loss > 0 ? current_loss : 0)) / length)
    }

    var period = periodService.getCurrentPeriod()
    if(period[key + '_avg_loss'] == 0) {
      periodService.setFieldOnCurrentPeriod(key, 100)
    } else {
      var rs = period[key + '_avg_gain'] / period[key + '_avg_loss']
      periodService.setFieldOnCurrentPeriod(key, (100 - (100 / (1 + rs))).toFixed(2))
    }
  }
}

